import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Book a seat on a trip
   * Flow: Check availability → Validate payment → Create CONFIRMED booking
   * If wallet: atomic deduction inside transaction
   * If cash: booking confirmed, pay driver at trip time
   */
  async bookSeat(userId: string, tripId: string, seats: number = 1, paymentMethod: 'WALLET' | 'CASH' = 'CASH') {
    seats = Number(seats) || 1;
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the trip and verify availability
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { driver: { select: { firstName: true, lastName: true } } },
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      if (trip.driverId === userId) {
        throw new BadRequestException('You cannot book your own trip');
      }

      if (trip.status === 'CANCELLED' || trip.status === 'COMPLETED') {
        throw new BadRequestException('This trip is no longer available');
      }

      if (new Date(trip.departureTime) <= new Date()) {
        throw new BadRequestException('This trip has already departed');
      }

      // Check if user already has a booking
      const existingBooking = await tx.booking.findUnique({
        where: { userId_tripId: { userId, tripId } },
      });

      if (existingBooking && existingBooking.status !== 'CANCELLED') {
        throw new ConflictException(
          'You already have an active booking for this trip',
        );
      }

      // 2. Check seat availability
      if (trip.availableSeats < seats) {
        // Trip is full → add to waitlist
        return this.addToWaitlist(tx, userId, tripId);
      }

      // 3. Calculate total price
      const perSeat = Number(trip.pricePerSeat) > 0
        ? Number(trip.pricePerSeat)
        : Number(trip.price) / trip.totalSeats;
      const totalPrice = Math.round(perSeat * seats * 100) / 100;

      // 4. Handle wallet payment — atomic deduction
      let amountPaid = 0;
      if (paymentMethod === 'WALLET') {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.balance) < totalPrice) {
          throw new BadRequestException(
            `Insufficient wallet balance. Required: ${totalPrice} EGP, Available: ${wallet ? Number(wallet.balance) : 0} EGP`,
          );
        }

        // Atomic deduction
        await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: totalPrice } },
        });

        // Create PAYMENT transaction record
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'PAYMENT',
            amount: totalPrice,
            status: 'COMPLETED',
            reference: `BOOKING-${tripId}-${Date.now()}`,
            metadata: { tripId, seats, pricePerSeat: perSeat },
          },
        });

        amountPaid = totalPrice;
      }

      // 5. Create or re-activate booking (directly CONFIRMED)
      let booking;
      if (existingBooking && existingBooking.status === 'CANCELLED') {
        booking = await tx.booking.update({
          where: { id: existingBooking.id },
          data: {
            seats,
            status: BookingStatus.CONFIRMED,
            bookedAt: new Date(),
            paymentMethod,
            amountPaid: amountPaid > 0 ? amountPaid : null,
          },
          include: {
            trip: {
              select: {
                fromCity: true,
                toCity: true,
                departureTime: true,
                gatheringLocation: true,
              },
            },
          },
        });
      } else {
        booking = await tx.booking.create({
          data: {
            userId,
            tripId,
            seats,
            status: BookingStatus.CONFIRMED,
            paymentMethod,
            amountPaid: amountPaid > 0 ? amountPaid : null,
          },
          include: {
            trip: {
              select: {
                fromCity: true,
                toCity: true,
                departureTime: true,
                gatheringLocation: true,
              },
            },
          },
        });
      }

      // 6. Decrease available seats
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { availableSeats: { decrement: seats } },
      });

      // Broadcast real-time seat update
      this.notificationGateway.broadcastTripUpdate(tripId, {
        availableSeats: updatedTrip.availableSeats,
      });

      // 7. Send confirmation notification to passenger
      const confirmMsg = paymentMethod === 'WALLET'
        ? `تم حجز مقعدك بنجاح! تم خصم ${totalPrice} جنيه من المحفظة. نقطة التجمع: ${trip.gatheringLocation}`
        : `تم تأكيد الرحلة بنجاح! المبلغ المطلوب دفعه للسائق: ${totalPrice} جنيه. نقطة التجمع: ${trip.gatheringLocation}`;
      await this.notificationService.createInTransaction(tx, {
        userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed! ✅',
        message: confirmMsg,
        metadata: { bookingId: booking.id, tripId, paymentMethod, amountPaid },
      });

      // 8. Notify the driver about new booking
      const passenger = await tx.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
      await this.notificationService.createInTransaction(tx, {
        userId: trip.driverId,
        type: 'BOOKING_CONFIRMED',
        title: 'New Seat Booked! 🎫',
        message: `${passenger?.firstName || 'A passenger'} ${passenger?.lastName || ''} booked ${seats} seat(s) on your trip ${trip.fromCity} → ${trip.toCity}. ${updatedTrip.availableSeats} seats remaining.`,
        metadata: { bookingId: booking.id, tripId },
      });

      return { ...booking, paymentMethod, amountPaid, totalPrice };
    });
  }

  /**
   * Add user to waitlist when trip is full
   */
  private async addToWaitlist(tx: any, userId: string, tripId: string) {
    // Check if already on waitlist
    const existing = await tx.waitlist.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (existing) {
      throw new ConflictException(
        'You are already on the waitlist for this trip',
      );
    }

    // Get next position
    const lastPosition = await tx.waitlist.findFirst({
      where: { tripId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (lastPosition?.position ?? 0) + 1;

    const waitlistEntry = await tx.waitlist.create({
      data: { userId, tripId, position },
    });

    await this.notificationService.createInTransaction(tx, {
      userId,
      type: 'WAITLIST_PROMOTED',
      title: 'Added to Waitlist',
      message: `The trip is full. You are #${position} on the waitlist. We'll notify you if a seat opens up.`,
    });

    return { waitlisted: true, position, entry: waitlistEntry };
  }

  /**
   * Cancel a booking — allowed until 8 hours before departure
   * Refunds to wallet only if original payment was via wallet
   */
  async cancelBooking(userId: string, bookingId: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trip: true },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new BadRequestException('You can only cancel your own bookings');
      }

      if (booking.status === 'CANCELLED') {
        throw new BadRequestException('This booking is already cancelled');
      }

      if (booking.status === 'COMPLETED') {
        throw new BadRequestException('Cannot cancel a completed booking');
      }

      // 8-hour cancellation policy
      const departure = new Date(booking.trip.departureTime);
      const now = new Date();
      const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 8) {
        throw new BadRequestException(
          'لا يمكن إلغاء الحجز قبل موعد الرحلة بأقل من 8 ساعات. Cannot cancel less than 8 hours before departure.',
        );
      }

      // 1. Cancel the booking
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // 2. Restore available seats
      const updatedTrip = await tx.trip.update({
        where: { id: booking.tripId },
        data: { availableSeats: { increment: booking.seats } },
      });

      // Broadcast real-time seat update
      this.notificationGateway.broadcastTripUpdate(booking.tripId, {
        availableSeats: updatedTrip.availableSeats,
      });

      // 3. Refund to wallet only if paid via wallet
      let refundAmount = 0;
      if (booking.paymentMethod === 'WALLET' && booking.amountPaid) {
        refundAmount = Number(booking.amountPaid);
        const wallet = await tx.wallet.findUnique({ where: { userId } });

        if (wallet) {
          await tx.wallet.update({
            where: { userId },
            data: { balance: { increment: refundAmount } },
          });

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: 'REFUND',
              amount: refundAmount,
              status: 'COMPLETED',
              reference: `REFUND-${bookingId}`,
              metadata: { bookingId, tripId: booking.tripId },
            },
          });
        }
      }

      // 4. Notify the driver about cancellation
      const passenger = await tx.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
      await this.notificationService.createInTransaction(tx, {
        userId: booking.trip.driverId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled 🚫',
        message: `${passenger?.firstName || 'A passenger'} ${passenger?.lastName || ''} cancelled their ${booking.seats} seat(s) on your trip ${booking.trip.fromCity} → ${booking.trip.toCity}. ${updatedTrip.availableSeats} seats now available.`,
        metadata: { bookingId, tripId: booking.tripId },
      });

      // 5. Promote next waitlisted user
      await this.promoteFromWaitlist(tx, booking.tripId);

      return { cancelled: true, refundAmount };
    });
  }

  /**
   * Promote the top waitlisted user when a seat opens up
   */
  private async promoteFromWaitlist(tx: any, tripId: string) {
    const nextInLine = await tx.waitlist.findFirst({
      where: { tripId },
      orderBy: { position: 'asc' },
      include: { user: { select: { firstName: true } } },
    });

    if (!nextInLine) return;

    // Remove from waitlist
    await tx.waitlist.delete({ where: { id: nextInLine.id } });

    // Re-sequence remaining waitlist positions
    await tx.waitlist.updateMany({
      where: { tripId, position: { gt: nextInLine.position } },
      data: { position: { decrement: 1 } },
    });

    // Notify the promoted user
    await this.notificationService.createInTransaction(tx, {
      userId: nextInLine.userId,
      type: 'WAITLIST_PROMOTED',
      title: 'A seat is now available! 🎉',
      message: `A seat has opened up on your waitlisted trip. Book now before it's taken!`,
      metadata: { tripId },
    });
  }



  /**
   * Get bookings for a user
   */
  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      orderBy: { bookedAt: 'desc' },
      include: {
        trip: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                driverProfile: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get bookings for a trip (Driver view)
   */
  async getTripBookings(tripId: string) {
    return this.prisma.booking.findMany({
      where: { tripId, status: { in: ['CONFIRMED', 'PENDING'] } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}

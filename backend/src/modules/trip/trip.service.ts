import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto, FilterTripsDto } from './dto/trip.dto';
import { Prisma, TripStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { CommissionService } from '../commission/commission.service';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private readonly commissionService: CommissionService,
  ) {}

  /**
   * Calculate distance between two GPS points using Haversine formula
   */
  private calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }

  /**
   * Create a new trip (Driver only)
   */
  async create(driverId: string, dto: CreateTripDto) {
    // Auto-calculate distance if both coordinates are provided
    let distanceKm: number | undefined;
    if (
      dto.gatheringLatitude && dto.gatheringLongitude &&
      dto.destinationLatitude && dto.destinationLongitude
    ) {
      distanceKm = this.calculateDistance(
        dto.gatheringLatitude, dto.gatheringLongitude,
        dto.destinationLatitude, dto.destinationLongitude,
      );
    }

    return this.prisma.trip.create({
      data: {
        driverId,
        fromCity: dto.fromCity,
        toCity: dto.toCity,
        fromAddress: dto.fromAddress,
        toAddress: dto.toAddress,
        gatheringLocation: dto.gatheringLocation,
        gatheringLatitude: dto.gatheringLatitude,
        gatheringLongitude: dto.gatheringLongitude,
        destinationLatitude: dto.destinationLatitude,
        destinationLongitude: dto.destinationLongitude,
        distanceKm,
        departureTime: new Date(dto.departureTime),
        estimatedArrival: dto.estimatedArrival
          ? new Date(dto.estimatedArrival)
          : undefined,
        price: dto.price,
        totalSeats: dto.totalSeats,
        availableSeats: dto.totalSeats,
        notes: dto.notes,
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            driverProfile: true,
          },
        },
      },
    });
  }

  /**
   * Get all trips with filtering, sorting, and pagination
   */
  async findAll(filters: FilterTripsDto) {
    const {
      q,
      fromCity,
      toCity,
      date,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = filters;

    const where: Prisma.TripWhereInput = {
      status: { in: [TripStatus.SCHEDULED, TripStatus.DRIVER_CONFIRMED] },
      departureTime: { gte: new Date() },
    };

    // Unified text search across multiple fields
    if (q && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { fromCity: { contains: searchTerm, mode: 'insensitive' } },
        { toCity: { contains: searchTerm, mode: 'insensitive' } },
        { gatheringLocation: { contains: searchTerm, mode: 'insensitive' } },
        { fromAddress: { contains: searchTerm, mode: 'insensitive' } },
        { toAddress: { contains: searchTerm, mode: 'insensitive' } },
        { driver: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
        { driver: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    if (fromCity) {
      where.fromCity = { contains: fromCity, mode: 'insensitive' };
    }

    if (toCity) {
      where.toCity = { contains: toCity, mode: 'insensitive' };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.departureTime = {
        ...(where.departureTime as Prisma.DateTimeFilter),
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        (where.price as Prisma.DecimalFilter).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.price as Prisma.DecimalFilter).lte = maxPrice;
      }
    }

    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: 'asc' },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatarUrl: true,
              driverProfile: true,
            },
          },
          _count: {
            select: {
              bookings: { where: { status: { in: ['CONFIRMED', 'PENDING'] } } },
              waitlists: true,
            },
          },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      trips,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single trip by ID with full details
   */
  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            driverProfile: true,
            ratingsReceived: {
              select: { score: true },
            },
          },
        },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
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
        },
        _count: {
          select: { waitlists: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  /**
   * Update/edit a trip (Driver only, within 5 hours of creation, SCHEDULED only)
   */
  async updateTrip(tripId: string, driverId: string, dto: Partial<CreateTripDto>) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Only the trip driver can edit this trip');
    }
    if (trip.status !== 'SCHEDULED') {
      throw new BadRequestException('Can only edit trips with SCHEDULED status. Once you mark ready, editing is not allowed.');
    }
    // 1-hour window check
    const hoursSinceCreation = (Date.now() - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 1) {
      throw new BadRequestException('You can only edit a trip within 1 hour of creation.');
    }

    const updateData: any = {};
    if (dto.fromCity !== undefined) updateData.fromCity = dto.fromCity;
    if (dto.toCity !== undefined) updateData.toCity = dto.toCity;
    if (dto.fromAddress !== undefined) updateData.fromAddress = dto.fromAddress;
    if (dto.toAddress !== undefined) updateData.toAddress = dto.toAddress;
    if (dto.gatheringLocation !== undefined) updateData.gatheringLocation = dto.gatheringLocation;
    if (dto.gatheringLatitude !== undefined) updateData.gatheringLatitude = dto.gatheringLatitude;
    if (dto.gatheringLongitude !== undefined) updateData.gatheringLongitude = dto.gatheringLongitude;
    if (dto.destinationLatitude !== undefined) updateData.destinationLatitude = dto.destinationLatitude;
    if (dto.destinationLongitude !== undefined) updateData.destinationLongitude = dto.destinationLongitude;
    if (dto.departureTime !== undefined) updateData.departureTime = new Date(dto.departureTime);
    if (dto.estimatedArrival !== undefined) updateData.estimatedArrival = new Date(dto.estimatedArrival);
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    // Recalculate distance if coordinates changed
    const gLat = updateData.gatheringLatitude ?? trip.gatheringLatitude;
    const gLng = updateData.gatheringLongitude ?? trip.gatheringLongitude;
    const dLat = updateData.destinationLatitude ?? trip.destinationLatitude;
    const dLng = updateData.destinationLongitude ?? trip.destinationLongitude;
    if (gLat && gLng && dLat && dLng) {
      updateData.distanceKm = this.calculateDistance(gLat, gLng, dLat, dLng);
    }
    if (dto.totalSeats !== undefined) {
      const bookedSeats = trip.totalSeats - trip.availableSeats;
      if (dto.totalSeats < bookedSeats) {
        throw new BadRequestException(`Cannot reduce seats below ${bookedSeats} (already booked).`);
      }
      updateData.totalSeats = dto.totalSeats;
      updateData.availableSeats = dto.totalSeats - bookedSeats;
    }

    return this.prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            driverProfile: true,
          },
        },
      },
    });
  }

  /**
   * Cancel a trip (Driver only, within 1 hour = direct cancel)
   */
  async cancelTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== userId) {
      throw new ForbiddenException('Only the trip driver can cancel this trip');
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot cancel a trip with status ${trip.status}`);
    }

    if (trip.status === 'IN_PROGRESS') {
      throw new BadRequestException('Cannot cancel a trip that is already in progress.');
    }

    // Check if within 1 hour of creation
    const hoursSinceCreation = (Date.now() - new Date(trip.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 1) {
      throw new BadRequestException('You cannot directly cancel a trip after 1 hour. Please submit a cancellation request.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Cancel the trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.CANCELLED },
      });

      // Cancel all bookings and notify passengers
      const bookings = await tx.booking.findMany({
        where: { tripId, status: { in: ['CONFIRMED', 'PENDING'] } },
      });

      for (const booking of bookings) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        // Send cancellation notification
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_CANCELLED',
            title: 'Trip Cancelled ❌',
            message: `The trip from ${trip.fromCity} to ${trip.toCity} on ${new Date(trip.departureTime).toLocaleDateString()} has been cancelled by the driver. Your booking has been automatically cancelled.`,
          },
        });
      }

      // Clear waitlist
      await tx.waitlist.deleteMany({ where: { tripId } });

      // Broadcast cancellation
      this.notificationGateway.broadcastTripUpdate(tripId, {
        status: updatedTrip.status,
      });

      return updatedTrip;
    }, { timeout: 30000 });
  }

  /**
   * Request cancellation for a trip (after 1 hour - needs admin approval)
   */
  async requestCancellation(tripId: string, driverId: string, reason: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Only the trip driver can request cancellation');
    }
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot cancel a trip with status ${trip.status}`);
    }
    if (trip.status === 'IN_PROGRESS') {
      throw new BadRequestException('Cannot cancel a trip that is in progress.');
    }

    // Check if already has a pending request
    const existing = await this.prisma.cancellationRequest.findUnique({ where: { tripId } });
    if (existing && existing.status === 'PENDING') {
      throw new BadRequestException('A cancellation request is already pending for this trip.');
    }

    // Create or update cancellation request
    const request = await this.prisma.cancellationRequest.upsert({
      where: { tripId },
      create: {
        tripId,
        driverId,
        reason,
      },
      update: {
        reason,
        status: 'PENDING',
        adminNote: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    // Notify admin(s)
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'DRIVER_ALERT' as any,
          title: 'Cancellation Request 🚨',
          message: `Driver requests to cancel trip ${trip.fromCity} → ${trip.toCity} (${new Date(trip.departureTime).toLocaleDateString()}). Reason: ${reason}`,
          metadata: { tripId, cancellationRequestId: request.id } as any,
        },
      });
    }

    // Notify driver
    await this.prisma.notification.create({
      data: {
        userId: driverId,
        type: 'TRIP_REMINDER' as any,
        title: 'Cancellation Request Submitted 📩',
        message: `Your cancellation request for ${trip.fromCity} → ${trip.toCity} has been submitted. Admin will review it and get back to you.`,
        metadata: { tripId, cancellationRequestId: request.id } as any,
      },
    });

    return request;
  }

  /**
   * Admin: approve cancellation request
   */
  async approveCancellation(requestId: string, adminId: string) {
    const request = await this.prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!request) throw new NotFoundException('Cancellation request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been reviewed');
    }

    return this.prisma.$transaction(async (tx) => {
      // Approve request
      await tx.cancellationRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
      });

      // Cancel the trip
      const updatedTrip = await tx.trip.update({
        where: { id: request.tripId },
        data: { status: TripStatus.CANCELLED },
      });

      // Cancel bookings + notify passengers
      const bookings = await tx.booking.findMany({
        where: { tripId: request.tripId, status: { in: ['CONFIRMED', 'PENDING'] } },
      });

      for (const booking of bookings) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'BOOKING_CANCELLED',
            title: 'Trip Cancelled ❌',
            message: `The trip from ${request.trip.fromCity} to ${request.trip.toCity} has been cancelled. Your booking has been automatically cancelled.`,
          },
        });
      }

      // Clear waitlist
      await tx.waitlist.deleteMany({ where: { tripId: request.tripId } });

      // Notify driver
      await tx.notification.create({
        data: {
          userId: request.driverId,
          type: 'TRIP_REMINDER' as any,
          title: 'Cancellation Approved ✅',
          message: `Your cancellation request for ${request.trip.fromCity} → ${request.trip.toCity} has been approved. The trip has been cancelled.`,
          metadata: { tripId: request.tripId } as any,
        },
      });

      this.notificationGateway.broadcastTripUpdate(request.tripId, { status: updatedTrip.status });

      return { approved: true };
    }, { timeout: 30000 });
  }

  /**
   * Admin: reject cancellation request
   */
  async rejectCancellation(requestId: string, adminId: string, note?: string) {
    const request = await this.prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!request) throw new NotFoundException('Cancellation request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been reviewed');
    }

    await this.prisma.cancellationRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminNote: note || 'Cancellation request rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Notify driver
    await this.prisma.notification.create({
      data: {
        userId: request.driverId,
        type: 'TRIP_REMINDER' as any,
        title: 'Cancellation Rejected ❌',
        message: note
          ? `Your cancellation request for ${request.trip.fromCity} → ${request.trip.toCity} was rejected. Reason: ${note}`
          : `Your cancellation request for ${request.trip.fromCity} → ${request.trip.toCity} was rejected. The trip remains active.`,
        metadata: { tripId: request.tripId } as any,
      },
    });

    return { rejected: true };
  }

  /**
   * Admin: get pending cancellation requests
   */
  async getPendingCancellations() {
    return this.prisma.cancellationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        driver: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        trip: {
          select: { id: true, fromCity: true, toCity: true, departureTime: true, status: true, totalSeats: true, availableSeats: true },
        },
      },
    });
  }

  /**
   * Get trips by driver
   */
  async findByDriver(driverId: string) {
    return this.prisma.trip.findMany({
      where: { driverId },
      orderBy: { departureTime: 'desc' },
      include: {
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          select: {
            id: true,
            seats: true,
            status: true,
            isReady: true,
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
            waitlists: true,
          },
        },
      },
    });
  }

  /**
   * Mark driver as ready for the trip
   */
  async markDriverReady(tripId: string, driverId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can mark this trip as ready');
    }
    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: { driverReadyAt: new Date(), status: TripStatus.DRIVER_CONFIRMED },
    });

    // Notify all confirmed passengers
    const bookings = await this.prisma.booking.findMany({
      where: { tripId, status: 'CONFIRMED' },
      select: { userId: true },
    });

    for (const booking of bookings) {
      await this.notificationService.create({
        userId: booking.userId,
        type: 'TRIP_REMINDER',
        title: 'Driver is Ready! 🚗',
        message: `Your driver for ${trip.fromCity} → ${trip.toCity} is ready. Please mark yourself as ready and head to: ${trip.gatheringLocation}`,
        metadata: { tripId },
      });
    }

    // Broadcast trip update
    this.notificationGateway.broadcastTripUpdate(tripId, {
      status: updated.status,
      driverReadyAt: updated.driverReadyAt,
    });

    return updated;
  }

  /**
   * Start a trip (transition from DRIVER_CONFIRMED -> IN_PROGRESS)
   */
  async startTrip(tripId: string, driverId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can start this trip');
    }
    if (trip.status !== 'DRIVER_CONFIRMED' && trip.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot start trip with status ${trip.status}. Trip must be in SCHEDULED or DRIVER_CONFIRMED status.`,
      );
    }

    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.IN_PROGRESS },
    });

    // Notify passengers that the trip has started
    const bookings = await this.prisma.booking.findMany({
      where: { tripId, status: 'CONFIRMED' },
      select: { userId: true },
    });

    for (const booking of bookings) {
      await this.notificationService.create({
        userId: booking.userId,
        type: 'TRIP_REMINDER',
        title: 'Trip Started! 🚀',
        message: `The trip from ${trip.fromCity} to ${trip.toCity} has started. Enjoy your ride!`,
        metadata: { tripId },
      });
    }

    // Broadcast trip update
    this.notificationGateway.broadcastTripUpdate(tripId, {
      status: updated.status,
    });

    return updated;
  }

  /**
   * Complete a trip
   */
  async completeTrip(tripId: string, driverId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.driverId !== driverId) {
      throw new ForbiddenException('Only the driver can complete this trip');
    }
    if (trip.status !== 'IN_PROGRESS' && trip.status !== 'DRIVER_CONFIRMED' && trip.status !== 'SCHEDULED') {
      throw new BadRequestException(`Cannot complete trip with status ${trip.status}`);
    }

    const txResult = await this.prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED },
      });

      // Complete all confirmed bookings
      await tx.booking.updateMany({
        where: { tripId, status: 'CONFIRMED' },
        data: { status: 'COMPLETED' },
      });

      // Get completed bookings with user info
      const bookings = await tx.booking.findMany({
        where: { tripId, status: 'COMPLETED' },
        select: { userId: true, seats: true, user: { select: { firstName: true, lastName: true } } },
      });

      const pricePerSeat = Number(trip.price) / trip.totalSeats;
      const totalBookedSeats = bookings.reduce((sum, b) => sum + b.seats, 0);
      const totalDriverEarnings = Math.round(pricePerSeat * totalBookedSeats * 100) / 100;

      // ── Notify each passenger → "pay your fare" ──
      for (const booking of bookings) {
        const seatCost = Math.round(pricePerSeat * booking.seats * 100) / 100;
        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'TRIP_REMINDER',
            title: 'Trip Completed! 🎉',
            message: `Your trip from ${trip.fromCity} to ${trip.toCity} is complete. Please pay ${seatCost} EGP for your ${booking.seats} seat(s). Thank you for traveling with Mashaweer!`,
            metadata: { tripId, amount: seatCost } as any,
          },
        });
      }

      // Broadcast trip update
      this.notificationGateway.broadcastTripUpdate(tripId, {
        status: updatedTrip.status,
      });

      return updatedTrip;
    }, { timeout: 30000 });

    // ── After transaction: create Commission record + notify driver ──
    const settings = await this.prisma.platformSetting.upsert({
      where: { id: 'platform_settings' },
      update: {},
      create: { id: 'platform_settings' },
    });
    const commissionRate = settings.commissionRate;

    const completedBookings = await this.prisma.booking.findMany({
      where: { tripId, status: 'COMPLETED' },
      select: { seats: true },
    });
    const pricePerSeatFinal = Number(trip!.price) / trip!.totalSeats;
    const totalBookedFinal = completedBookings.reduce((s, b) => s + b.seats, 0);
    const earningsFinal = Math.round(pricePerSeatFinal * totalBookedFinal * 100) / 100;

    // Create commission record
    const commission = await this.commissionService.createTripCommission(
      driverId,
      tripId,
      earningsFinal,
      commissionRate,
    );

    // Credit driver wallet with total earnings
    let driverWallet = await this.prisma.wallet.findUnique({ where: { userId: driverId } });
    if (!driverWallet) {
      driverWallet = await this.prisma.wallet.create({ data: { userId: driverId } });
    }
    await this.prisma.wallet.update({
      where: { userId: driverId },
      data: { balance: { increment: earningsFinal } },
    });
    // Log EARNING transaction
    await this.prisma.transaction.create({
      data: {
        walletId: driverWallet.id,
        type: 'DEPOSIT',
        amount: earningsFinal,
        status: 'COMPLETED',
        reference: `EARNING-${tripId}`,
        metadata: {
          tripId,
          type: 'TRIP_EARNING',
          bookedSeats: totalBookedFinal,
          pricePerSeat: pricePerSeatFinal,
          commission: Number(commission.amount),
        },
      },
    });

    // Notify driver with earnings + commission info
    await this.prisma.notification.create({
      data: {
        userId: driverId,
        type: 'COMMISSION_ADDED' as any,
        title: 'Trip Completed — Commission Added 💰',
        message: `Your trip ${trip!.fromCity} → ${trip!.toCity} is complete! You earned ${earningsFinal} EGP. Commission: ${Number(commission.amount)} EGP (${(commissionRate * 100).toFixed(0)}%). Pay via Wallet → Commission.`,
        metadata: {
          tripId,
          earnings: earningsFinal,
          commission: Number(commission.amount),
          commissionId: commission.id,
        } as any,
      },
    });

    return txResult;
  }
}

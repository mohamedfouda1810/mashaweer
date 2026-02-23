import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class DriverService {
  private readonly logger = new Logger(DriverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Driver clicks "I'm Ready" button
   * - Must be done ≤15 minutes before departure
   * - Sets driverConfirmedAt on the trip
   * - Updates trip status to DRIVER_CONFIRMED
   */
  async confirmReady(driverId: string, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== driverId) {
      throw new ForbiddenException('You are not the driver of this trip');
    }

    if (trip.status === 'CANCELLED') {
      throw new BadRequestException('This trip has been cancelled');
    }

    if (trip.status === 'COMPLETED') {
      throw new BadRequestException('This trip is already completed');
    }

    if (trip.driverConfirmedAt) {
      throw new BadRequestException('You have already confirmed readiness');
    }

    const now = new Date();
    const departureTime = new Date(trip.departureTime);
    const minutesUntilDeparture =
      (departureTime.getTime() - now.getTime()) / (1000 * 60);

    // Driver can only confirm within a reasonable window (e.g., 60 min before)
    if (minutesUntilDeparture > 60) {
      throw new BadRequestException(
        'You can only confirm readiness within 60 minutes of departure time',
      );
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        driverConfirmedAt: now,
        status: TripStatus.DRIVER_CONFIRMED,
      },
    });

    this.logger.log(
      `Driver ${driverId} confirmed ready for trip ${tripId} ` +
        `(${minutesUntilDeparture.toFixed(1)} min before departure)`,
    );

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
        message: `Your driver for ${trip.fromCity} → ${trip.toCity} is ready. Head to the gathering point: ${trip.gatheringLocation}`,
        metadata: { tripId },
      });
    }

    return updatedTrip;
  }

  /**
   * Admin marks a driver as no-show
   * - Increments noShowCount
   * - Auto-bans at 2 no-shows
   */
  async markNoShow(driverId: string, tripId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: driverId } });

      if (!user || user.role !== 'DRIVER') {
        throw new NotFoundException('Driver not found');
      }

      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip || trip.driverId !== driverId) {
        throw new BadRequestException('Trip does not belong to this driver');
      }

      // Increment no-show count
      const newNoShowCount = user.noShowCount + 1;
      const shouldBan = newNoShowCount >= 2;

      const updatedUser = await tx.user.update({
        where: { id: driverId },
        data: {
          noShowCount: newNoShowCount,
          isBanned: shouldBan,
          banReason: shouldBan
            ? `Auto-banned: ${newNoShowCount} no-show events recorded`
            : undefined,
        },
      });

      // Cancel the trip
      await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.CANCELLED },
      });

      // Resolve the admin alert
      await tx.adminAlert.updateMany({
        where: { tripId, driverId, isResolved: false },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: adminId,
        },
      });

      // Notify the driver
      await tx.notification.create({
        data: {
          userId: driverId,
          type: shouldBan ? 'ACCOUNT_BANNED' : 'DRIVER_ALERT',
          title: shouldBan ? 'Account Banned ⛔' : 'No-Show Warning ⚠️',
          message: shouldBan
            ? `Your account has been banned due to ${newNoShowCount} no-show events. Contact support to appeal.`
            : `You have recorded ${newNoShowCount} no-show event(s). 2 no-shows will result in an automatic ban.`,
        },
      });

      this.logger.warn(
        `Driver ${driverId} marked as no-show for trip ${tripId}. ` +
          `Total no-shows: ${newNoShowCount}. Banned: ${shouldBan}`,
      );

      return {
        noShowCount: newNoShowCount,
        isBanned: shouldBan,
        driver: updatedUser,
      };
    });
  }

  /**
   * Get driver dashboard data
   */
  async getDashboard(driverId: string) {
    const [upcomingTrips, pastTrips, ratings, wallet] = await Promise.all([
      this.prisma.trip.findMany({
        where: {
          driverId,
          departureTime: { gte: new Date() },
          status: { in: ['SCHEDULED', 'DRIVER_CONFIRMED'] },
        },
        orderBy: { departureTime: 'asc' },
        include: {
          _count: {
            select: {
              bookings: { where: { status: 'CONFIRMED' } },
            },
          },
        },
      }),
      this.prisma.trip.findMany({
        where: {
          driverId,
          status: 'COMPLETED',
        },
        orderBy: { departureTime: 'desc' },
        take: 10,
      }),
      this.prisma.rating.aggregate({
        where: { ratedId: driverId },
        _avg: { score: true },
        _count: { score: true },
      }),
      this.prisma.wallet.findUnique({
        where: { userId: driverId },
        select: { balance: true },
      }),
    ]);

    return {
      upcomingTrips,
      pastTrips,
      rating: {
        average: ratings._avg.score ?? 0,
        totalReviews: ratings._count.score,
      },
      walletBalance: wallet ? Number(wallet.balance) : 0,
    };
  }
}

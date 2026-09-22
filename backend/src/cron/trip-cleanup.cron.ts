// ============================================================================
// Trip Cleanup Cron Job
// ============================================================================
// Runs every hour and deletes trips that have been COMPLETED for more than
// 7 days. This keeps the database clean and avoids stale data.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class TripCleanupCronService {
  private readonly logger = new Logger(TripCleanupCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every hour to delete completed trips older than 7 days.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleTripCleanup() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // Find completed trips older than 7 days
      const staleTrips = await this.prisma.trip.findMany({
        where: {
          status: TripStatus.COMPLETED,
          updatedAt: { lt: sevenDaysAgo },
        },
        select: { id: true },
      });

      if (staleTrips.length === 0) return;

      const tripIds = staleTrips.map((t) => t.id);

      // Delete in a transaction to ensure consistency
      await this.prisma.$transaction(async (tx) => {
        // Delete related records first (ratings don't have onDelete cascade)
        await tx.rating.deleteMany({ where: { tripId: { in: tripIds } } });
        await tx.adminAlert.deleteMany({ where: { tripId: { in: tripIds } } });

        // Bookings, waitlists cascade via schema onDelete: Cascade
        // Now delete the trips
        const result = await tx.trip.deleteMany({
          where: { id: { in: tripIds } },
        });

        this.logger.log(
          `Cleaned up ${result.count} completed trip(s) older than 7 days`,
        );
      });
    } catch (error) {
      this.logger.error(`Trip cleanup failed: ${error.message}`);
    }
  }

  /**
   * Runs every 15 minutes to auto-cancel trips that are more than 2 hours overdue.
   */
  @Cron('*/15 * * * *')
  async handleTripExpiry() {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    try {
      const expiredTrips = await this.prisma.trip.findMany({
        where: {
          status: { in: [TripStatus.SCHEDULED, TripStatus.DRIVER_CONFIRMED] },
          departureTime: { lt: twoHoursAgo },
        },
        include: {
          bookings: {
            where: { status: 'CONFIRMED' },
            include: { user: { include: { wallet: true } } },
          },
        },
      });

      if (expiredTrips.length === 0) return;

      let cancelledCount = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const trip of expiredTrips) {
          // Update trip status
          await tx.trip.update({
            where: { id: trip.id },
            data: {
              status: TripStatus.CANCELLED,
              notes: 'Auto-cancelled: departure time passed without driver starting the trip',
            },
          });

          // Refund and cancel confirmed bookings
          for (const booking of trip.bookings) {
            const pricePerSeat = Number(trip.price) / trip.totalSeats;
            const refundAmount = pricePerSeat * booking.seats;

            if (booking.user.wallet) {
              await tx.wallet.update({
                where: { id: booking.user.wallet.id },
                data: { balance: { increment: refundAmount } },
              });

              await tx.transaction.create({
                data: {
                  walletId: booking.user.wallet.id,
                  amount: refundAmount,
                  type: 'REFUND',
                  status: 'COMPLETED',
                  reference: `Refund: auto-cancelled trip ${trip.fromCity} → ${trip.toCity}`,
                },
              });
            }

            await tx.booking.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED' },
            });
          }

          cancelledCount++;
        }
      });

      this.logger.log(`Auto-expired ${cancelledCount} overdue trip(s)`);
    } catch (error) {
      this.logger.error(`Trip auto-expiry failed: ${error.message}`);
    }
  }
}

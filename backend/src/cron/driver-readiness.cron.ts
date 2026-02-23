// ============================================================================
// CRITICAL: Driver Readiness Cron Job
// ============================================================================
// This service runs every minute and handles two key business rules:
//
// 1) 3-HOUR CHECK: Sends a reminder notification/SMS to the driver
//    3 hours before their trip departure time.
//
// 2) 15-MINUTE CHECK: If a driver has NOT clicked "I'm Ready" within
//    15 minutes of departure, creates an urgent AdminAlert for the
//    admin dashboard.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../modules/notification/notification.service';
import { AlertType, TripStatus } from '@prisma/client';

@Injectable()
export class DriverReadinessCronService {
  private readonly logger = new Logger(DriverReadinessCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Runs every minute to check driver readiness rules.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDriverReadinessCheck() {
    const now = new Date();

    await Promise.all([
      this.send3HourReminders(now),
      this.check15MinuteReadiness(now),
    ]);
  }

  // ─── 3-Hour Reminder ───────────────────────────────────────────────

  /**
   * Find trips departing in ~3 hours (between 179-181 minutes from now)
   * where the reminder hasn't been sent yet.
   * Sends a confirmation notification/SMS to the driver.
   */
  private async send3HourReminders(now: Date) {
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const windowStart = new Date(threeHoursFromNow.getTime() - 60 * 1000); // -1 min
    const windowEnd = new Date(threeHoursFromNow.getTime() + 60 * 1000); // +1 min

    const tripsNeedingReminder = await this.prisma.trip.findMany({
      where: {
        status: TripStatus.SCHEDULED,
        reminderSentAt: null,
        departureTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
          },
        },
      },
    });

    for (const trip of tripsNeedingReminder) {
      try {
        // Send in-app notification
        await this.notificationService.create({
          userId: trip.driver.id,
          type: 'TRIP_REMINDER',
          title: 'Trip Reminder - 3 Hours ⏰',
          message:
            `Reminder: Your trip ${trip.fromCity} → ${trip.toCity} departs in 3 hours. ` +
            `You have ${trip._count.bookings} confirmed passengers. ` +
            `Please click "I'm Ready" at least 15 minutes before departure.`,
          metadata: { tripId: trip.id },
        });

        // Mark reminder as sent
        await this.prisma.trip.update({
          where: { id: trip.id },
          data: { reminderSentAt: now },
        });

        // TODO: Integrate SMS provider (Twilio/MessageBird) here
        // await this.smsService.send(trip.driver.phone, message);

        this.logger.log(
          `3hr reminder sent to driver ${trip.driver.firstName} ` +
            `(${trip.driver.id}) for trip ${trip.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send 3hr reminder for trip ${trip.id}: ${error.message}`,
        );
      }
    }

    if (tripsNeedingReminder.length > 0) {
      this.logger.log(
        `Processed ${tripsNeedingReminder.length} trip reminder(s)`,
      );
    }
  }

  // ─── 15-Minute Readiness Check ────────────────────────────────────

  /**
   * Find trips departing in ≤15 minutes where the driver has NOT
   * clicked "I'm Ready" (driverConfirmedAt IS NULL).
   * Creates an urgent AdminAlert for the admin dashboard.
   */
  private async check15MinuteReadiness(now: Date) {
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const unconfirmedTrips = await this.prisma.trip.findMany({
      where: {
        status: TripStatus.SCHEDULED,
        driverConfirmedAt: null,
        adminAlertSentAt: null, // Don't send duplicate alerts
        departureTime: {
          gte: now, // Trip hasn't departed yet
          lte: fifteenMinutesFromNow, // Departing within 15 minutes
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            noShowCount: true,
          },
        },
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
          },
        },
      },
    });

    for (const trip of unconfirmedTrips) {
      try {
        // Create urgent admin alert
        await this.prisma.adminAlert.create({
          data: {
            type: AlertType.DRIVER_NO_READY,
            tripId: trip.id,
            driverId: trip.driver.id,
            message:
              `🚨 URGENT: Driver ${trip.driver.firstName} ${trip.driver.lastName} ` +
              `has NOT confirmed readiness for trip ${trip.fromCity} → ${trip.toCity}. ` +
              `Departure: ${trip.departureTime.toISOString()}. ` +
              `${trip._count.bookings} passengers affected. ` +
              `Driver phone: ${trip.driver.phone}. ` +
              `Previous no-shows: ${trip.driver.noShowCount}.`,
          },
        });

        // Mark alert as sent on trip to prevent duplicates
        await this.prisma.trip.update({
          where: { id: trip.id },
          data: { adminAlertSentAt: now },
        });

        // Also notify the driver urgently
        await this.notificationService.create({
          userId: trip.driver.id,
          type: 'DRIVER_ALERT',
          title: '⚠️ URGENT: Confirm Your Trip!',
          message:
            `Your trip ${trip.fromCity} → ${trip.toCity} departs in less than 15 minutes! ` +
            `Click "I'm Ready" NOW or your trip may be cancelled and a no-show recorded.`,
          metadata: { tripId: trip.id },
        });

        this.logger.warn(
          `ADMIN ALERT: Driver ${trip.driver.id} has NOT confirmed readiness ` +
            `for trip ${trip.id} departing at ${trip.departureTime.toISOString()}. ` +
            `${trip._count.bookings} passengers affected.`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create admin alert for trip ${trip.id}: ${error.message}`,
        );
      }
    }

    if (unconfirmedTrips.length > 0) {
      this.logger.warn(
        `Created ${unconfirmedTrips.length} urgent admin alert(s) ` +
          `for unconfirmed drivers`,
      );
    }
  }
}

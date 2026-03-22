import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get all unresolved admin alerts (ordered by urgency)
   */
  async getAlerts(resolved = false) {
    return this.prisma.adminAlert.findMany({
      where: { isResolved: resolved },
      orderBy: { createdAt: 'desc' },
      include: {
        trip: {
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            departureTime: true,
            status: true,
            _count: {
              select: {
                bookings: { where: { status: 'CONFIRMED' } },
              },
            },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            noShowCount: true,
            isBanned: true,
          },
        },
      },
    });
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalTrips,
      activeTrips,
      completedTrips,
      pendingDeposits,
      unresolvedAlerts,
      bannedUsers,
      totalBookings,
      pendingDriverApps,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'DRIVER' } }),
      this.prisma.user.count({ where: { role: 'PASSENGER' } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({
        where: {
          status: { in: ['SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.trip.count({ where: { status: 'COMPLETED' } }),
      this.prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.adminAlert.count({ where: { isResolved: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.booking.count(),
      this.prisma.driverProfile.count({ where: { isApproved: false } }),
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalTrips,
      activeTrips,
      completedTrips,
      pendingDeposits,
      unresolvedAlerts,
      openAlerts: unresolvedAlerts,
      bannedDrivers: bannedUsers,
      bannedUsers,
      totalBookings,
      pendingDriverApps,
    };
  }

  /**
   * Ban/Unban a user
   */
  async toggleBan(userId: string, ban: boolean, reason?: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: ban,
        banReason: ban ? reason : null,
        banUntil: ban ? null : null, // permanent ban - no expiry
      },
    });
  }

  /**
   * Temporary ban a user for N days
   */
  async tempBanUser(userId: string, days: number, reason?: string) {
    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + days);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banUntil,
        banReason: reason || `Temporarily banned for ${days} days`,
      },
    });

    // Notify the user
    await this.notificationService.create({
      userId,
      type: 'ACCOUNT_BANNED',
      title: `Account Suspended for ${days} Days ⚠️`,
      message: `Your account has been suspended until ${banUntil.toLocaleDateString()}. Reason: ${reason || 'Policy violation'}`,
    });

    return user;
  }

  /**
   * Change user role
   */
  async changeRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  /**
   * Delete a user account and all related data
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot delete admin accounts');

    // Prisma cascades will handle related records due to onDelete: Cascade
    // But we need to manually clean up records without cascade
    await this.prisma.$transaction(async (tx) => {
      // Delete bookings
      await tx.booking.deleteMany({ where: { userId } });
      // Delete waitlists
      await tx.waitlist.deleteMany({ where: { userId } });
      // Delete notifications
      await tx.notification.deleteMany({ where: { userId } });
      // Delete ratings given
      await tx.rating.deleteMany({ where: { raterId: userId } });
      // Delete ratings received
      await tx.rating.deleteMany({ where: { ratedId: userId } });
      // Delete deposit requests
      await tx.depositRequest.deleteMany({ where: { userId } });
      // Delete transactions via wallet
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (wallet) {
        await tx.transaction.deleteMany({ where: { walletId: wallet.id } });
        await tx.wallet.delete({ where: { userId } });
      }
      // Delete driver profile
      await tx.driverProfile.deleteMany({ where: { userId } });
      // Delete trips (and cascade their bookings/waitlists)
      const trips = await tx.trip.findMany({ where: { driverId: userId }, select: { id: true } });
      for (const trip of trips) {
        await tx.booking.deleteMany({ where: { tripId: trip.id } });
        await tx.waitlist.deleteMany({ where: { tripId: trip.id } });
        await tx.adminAlert.deleteMany({ where: { tripId: trip.id } });
        await tx.rating.deleteMany({ where: { tripId: trip.id } });
      }
      await tx.trip.deleteMany({ where: { driverId: userId } });
      // Delete admin alerts for this driver
      await tx.adminAlert.deleteMany({ where: { driverId: userId } });
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return { deleted: true, userId };
  }

  /**
   * Create a new user account (admin action)
   */
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) throw new BadRequestException('Phone already in use');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role as any,
        isVerified: true,
        wallet: { create: { balance: 0 } },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(role?: string, page = 1, limit = 20) {
    const where: any = {};
    if (role) where.role = role;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          isBanned: true,
          banUntil: true,
          banReason: true,
          noShowCount: true,
          createdAt: true,
          driverProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Get pending driver profiles
   */
  async getPendingDrivers() {
    return this.prisma.driverProfile.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Approve a driver profile
   */
  async approveDriver(driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    const updated = await this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: { isApproved: true },
    });

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: profile.userId },
      data: { isVerified: true },
    });

    // Notify the driver
    await this.notificationService.create({
      userId: profile.userId,
      type: 'DRIVER_ALERT',
      title: 'Application Approved! 🎉',
      message: 'Your driver application has been approved. You can now log in and start creating trips!',
    });

    return updated;
  }

  /**
   * Decline/Delete a driver profile
   */
  async declineDriver(driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    // Notify the driver before deleting
    await this.notificationService.create({
      userId: profile.userId,
      type: 'DRIVER_ALERT',
      title: 'Application Declined ❌',
      message: 'Your driver application has been declined. Please contact support for more information or re-apply with correct documents.',
    });

    // Revert user role to passenger
    if (profile.user.role === 'DRIVER') {
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: { role: 'PASSENGER' },
      });
    }

    return this.prisma.driverProfile.delete({
      where: { id: driverProfileId },
    });
  }

  /**
   * Get all trips for admin dashboard
   */
  async getAllTrips(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        skip,
        take: limit,
        orderBy: { departureTime: 'desc' },
        include: {
          driver: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          _count: {
            select: {
              bookings: { where: { status: { in: ['CONFIRMED', 'PENDING'] } } },
            },
          },
        },
      }),
      this.prisma.trip.count(),
    ]);

    return { trips, total };
  }

  /**
   * Get financial report
   */
  async getFinancialReport() {
    // Get all completed trips with their bookings
    const completedTrips = await this.prisma.trip.findMany({
      where: { status: 'COMPLETED' },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          select: { seats: true },
        },
        driver: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Read commission rate from platform settings
    const settings = await this.prisma.platformSetting.upsert({
      where: { id: 'platform_settings' },
      update: {},
      create: { id: 'platform_settings' },
    });
    const COMMISSION_RATE = settings.commissionRate;

    let totalRevenue = 0;
    let totalDriverEarnings = 0;

    const tripDetails = completedTrips.map((trip) => {
      const bookedSeats = trip.bookings.reduce((sum, b) => sum + b.seats, 0);
      // price is TOTAL trip price, per-seat = price / totalSeats
      const pricePerSeat = Number(trip.price) / trip.totalSeats;
      const tripRevenue = pricePerSeat * bookedSeats;
      const commission = tripRevenue * COMMISSION_RATE;
      const driverEarning = tripRevenue - commission;

      totalRevenue += tripRevenue;
      totalDriverEarnings += driverEarning;

      return {
        tripId: trip.id,
        route: `${trip.fromCity} → ${trip.toCity}`,
        driver: `${trip.driver.firstName} ${trip.driver.lastName}`,
        driverId: trip.driver.id,
        bookedSeats,
        pricePerSeat: Math.round(pricePerSeat * 100) / 100,
        tripRevenue: Math.round(tripRevenue * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        driverEarning: Math.round(driverEarning * 100) / 100,
        departureTime: trip.departureTime,
      };
    });

    const totalCommission = totalRevenue * COMMISSION_RATE;

    // Get per-driver earnings breakdown
    const driverEarnings: Record<string, { name: string; totalEarnings: number; totalTrips: number; totalCommission: number }> = {};
    for (const td of tripDetails) {
      if (!driverEarnings[td.driverId]) {
        driverEarnings[td.driverId] = { name: td.driver, totalEarnings: 0, totalTrips: 0, totalCommission: 0 };
      }
      driverEarnings[td.driverId].totalEarnings += td.driverEarning;
      driverEarnings[td.driverId].totalTrips += 1;
      driverEarnings[td.driverId].totalCommission += td.commission;
    }

    // Get total transactions summary
    const [totalDeposits, totalRefunds] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'REFUND', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalDriverEarnings: Math.round(totalDriverEarnings * 100) / 100,
        commissionRate: COMMISSION_RATE,
        totalCompletedTrips: completedTrips.length,
        totalDeposits: Number(totalDeposits._sum.amount || 0),
        totalRefunds: Number(totalRefunds._sum.amount || 0),
      },
      driverBreakdown: Object.entries(driverEarnings).map(([id, data]) => ({
        driverId: id,
        ...data,
      })),
      recentTrips: tripDetails.slice(0, 20),
    };
  }

  // ─── Platform Settings ─────────────────────────────────────────────

  async getPlatformSettings() {
    return this.prisma.platformSetting.upsert({
      where: { id: 'platform_settings' },
      update: {},
      create: { id: 'platform_settings' },
    });
  }

  async updatePlatformSettings(data: {
    instapayNumber?: string;
    vodafoneCashNumber?: string;
    commissionRate?: number;
  }) {
    const updateData: any = {};
    if (data.instapayNumber !== undefined) updateData.instapayNumber = data.instapayNumber;
    if (data.vodafoneCashNumber !== undefined) updateData.vodafoneCashNumber = data.vodafoneCashNumber;
    if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate;

    return this.prisma.platformSetting.upsert({
      where: { id: 'platform_settings' },
      update: updateData,
      create: { id: 'platform_settings', ...updateData },
    });
  }

  // ─── All Transaction History ──────────────────────────────────────

  async getAllTransactions(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count(),
    ]);
    return { transactions, total };
  }

  // ─── User Profile Detail ──────────────────────────────────────────

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: true,
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
        bookings: {
          orderBy: { bookedAt: 'desc' },
          take: 20,
          include: {
            trip: {
              select: {
                id: true,
                fromCity: true,
                toCity: true,
                departureTime: true,
                status: true,
                price: true,
                totalSeats: true,
              },
            },
          },
        },
        tripsAsDriver: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            departureTime: true,
            status: true,
            price: true,
            totalSeats: true,
            availableSeats: true,
            _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
          },
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            trip: {
              select: { fromCity: true, toCity: true, departureTime: true },
            },
          },
        },
        commissionPayments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        ratingsReceived: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            rater: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

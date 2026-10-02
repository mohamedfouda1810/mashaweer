import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'DRIVER', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'PASSENGER', deletedAt: null } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({
        where: {
          status: { in: ['SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.trip.count({ where: { status: 'COMPLETED' } }),
      this.prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.adminAlert.count({ where: { isResolved: false } }),
      this.prisma.user.count({ where: { isBanned: true, deletedAt: null } }),
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
      where: { id: userId, deletedAt: null },
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
    const safeDays = Number.isFinite(days)
      ? Math.min(Math.max(Math.trunc(days), 1), 365)
      : 15;
    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + safeDays);

    const user = await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        isBanned: true,
        banUntil,
        banReason: reason || `Temporarily banned for ${safeDays} days`,
      },
    });

    // Notify the user
    await this.notificationService.create({
      userId,
      type: 'ACCOUNT_BANNED',
      title: `Account Suspended for ${safeDays} Days ⚠️`,
      message: `Your account has been suspended until ${banUntil.toLocaleDateString()}. Reason: ${reason || 'Policy violation'}`,
    });

    return user;
  }

  /**
   * Change user role
   */
  async changeRole(userId: string, role: string) {
    if (role !== 'ADMIN' && role !== 'DRIVER' && role !== 'PASSENGER') {
      throw new BadRequestException('Invalid user role');
    }
    return this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: { role: role as any },
    });
  }

  /**
   * Deactivate a user account without deleting historical records.
   * Relations are intentionally preserved so past trips retain their driver.
   * Replace unique login identifiers so a deleted account cannot block a new
   * registration with the same email address or phone number.
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN')
      throw new BadRequestException('Cannot delete admin accounts');
    if (user.deletedAt) return { deleted: true, softDeleted: true, userId };

    await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        email: `deleted-${user.id}@deleted.invalid`,
        phone: `deleted-${user.id}`,
        isBanned: true,
        banReason: 'Account deactivated by an administrator',
        banUntil: null,
        emailVerificationToken: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { deleted: true, softDeleted: true, userId };
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
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });
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
        emailVerified: true,
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
    const where: any = { deletedAt: null };
    if (role) where.role = role;

    const safePage = Number.isFinite(page) ? Math.max(Math.trunc(page), 1) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(Math.trunc(limit), 1), 100)
      : 20;
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
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
      message:
        'Your driver application has been approved. You can now log in and start creating trips!',
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
      message:
        'Your driver application has been declined. Please contact support for more information or re-apply with correct documents.',
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
          cancellationRequest: {
            select: {
              id: true,
              reason: true,
              status: true,
              createdAt: true,
            },
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
   * Get financial report.
   * Defaults to last 30 days to avoid loading all trips into memory.
   */
  async getFinancialReport(fromDate?: string, toDate?: string) {
    // Default to last 30 days if no date range provided
    const dateFrom = fromDate
      ? new Date(fromDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = toDate ? new Date(toDate) : new Date();

    // Get completed trips within the date range
    const completedTrips = await this.prisma.trip.findMany({
      where: {
        status: 'COMPLETED',
        departureTime: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          select: { seats: true },
        },
        driver: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { departureTime: 'desc' },
      take: 500, // Safety limit — prevent loading thousands of trips
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
    const driverEarnings: Record<
      string,
      {
        name: string;
        totalEarnings: number;
        totalTrips: number;
        totalCommission: number;
      }
    > = {};
    for (const td of tripDetails) {
      if (!driverEarnings[td.driverId]) {
        driverEarnings[td.driverId] = {
          name: td.driver,
          totalEarnings: 0,
          totalTrips: 0,
          totalCommission: 0,
        };
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
        dateRange: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
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
    if (data.instapayNumber !== undefined)
      updateData.instapayNumber = data.instapayNumber;
    if (data.vodafoneCashNumber !== undefined)
      updateData.vodafoneCashNumber = data.vodafoneCashNumber;
    if (data.commissionRate !== undefined)
      updateData.commissionRate = data.commissionRate;

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
            cancellationRequest: {
              select: { id: true, reason: true, status: true },
            },
            _count: {
              select: { bookings: { where: { status: 'CONFIRMED' } } },
            },
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

  // ─── Driver Documents Gallery ──────────────────────────────────────

  /**
   * Get all driver photos/documents for admin verification.
   * Returns categorized URLs for identity, driving license, car license, etc.
   */
  async getDriverDocuments(userId: string) {
    const profile = await this.prisma.driverProfile.findFirst({
      where: { userId },
      select: {
        id: true,
        personalPhotoUrl: true,
        carPhotoUrl: true,
        identityPhotos: true,
        drivingLicensePhotos: true,
        carLicensePhotos: true,
        carModel: true,
        plateNumber: true,
        licenseNumber: true,
        licenseExpiry: true,
        isApproved: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Driver profile not found');

    return {
      profile: {
        id: profile.id,
        carModel: profile.carModel,
        plateNumber: profile.plateNumber,
        licenseNumber: profile.licenseNumber,
        licenseExpiry: profile.licenseExpiry,
        isApproved: profile.isApproved,
        driver: profile.user,
      },
      documents: [
        {
          category: 'Personal Photo',
          urls: profile.personalPhotoUrl ? [profile.personalPhotoUrl] : [],
        },
        {
          category: 'Car Photo',
          urls: profile.carPhotoUrl ? [profile.carPhotoUrl] : [],
        },
        {
          category: 'Identity Documents',
          urls: profile.identityPhotos || [],
        },
        {
          category: 'Driving License',
          urls: profile.drivingLicensePhotos || [],
        },
        {
          category: 'Car License',
          urls: profile.carLicensePhotos || [],
        },
      ],
    };
  }

  // ─── Trip Detail ───────────────────────────────────────────────────

  /**
   * Get detailed information about a specific trip
   */
  async getTripDetail(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            driverProfile: {
              select: {
                carModel: true,
                plateNumber: true,
                licenseNumber: true,
              },
            },
          },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        cancellationRequest: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
          },
        },
        ratings: {
          include: {
            rater: true,
          },
        },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
      totalTrips,
      activeTrips,
      pendingDeposits,
      unresolvedAlerts,
      bannedUsers,
      totalBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'DRIVER' } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({
        where: {
          status: { in: ['SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.adminAlert.count({ where: { isResolved: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.booking.count(),
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalTrips,
      activeTrips,
      pendingDeposits,
      unresolvedAlerts,
      openAlerts: unresolvedAlerts, // alias for frontend
      bannedDrivers: bannedUsers,
      bannedUsers,
      totalBookings,
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
      },
    });
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
    return this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: { isApproved: true },
    });
  }

  /**
   * Decline/Delete a driver profile
   */
  async declineDriver(driverProfileId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: { user: true }
    });
    
    if (profile) {
      // Revert user role to passenger if their driver application is declined
      if (profile.user.role === 'DRIVER') {
        await this.prisma.user.update({
          where: { id: profile.userId },
          data: { role: 'PASSENGER' }
        });
      }
      return this.prisma.driverProfile.delete({
        where: { id: driverProfileId },
      });
    }
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
            select: { firstName: true, lastName: true, phone: true },
          },
          _count: {
            select: { bookings: true },
          },
        },
      }),
      this.prisma.trip.count(),
    ]);

    return { trips, total };
  }
}

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
      bannedDrivers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'DRIVER' } }),
      this.prisma.trip.count(),
      this.prisma.trip.count({
        where: { status: { in: ['SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS'] } },
      }),
      this.prisma.depositRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.adminAlert.count({ where: { isResolved: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalTrips,
      activeTrips,
      pendingDeposits,
      unresolvedAlerts,
      bannedDrivers,
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
}

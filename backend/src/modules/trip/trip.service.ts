import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto, FilterTripsDto } from './dto/trip.dto';
import { Prisma, TripStatus } from '@prisma/client';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new trip (Driver only)
   */
  async create(driverId: string, dto: CreateTripDto) {
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
    const { fromCity, toCity, date, minPrice, maxPrice, page = 1, limit = 10 } = filters;

    const where: Prisma.TripWhereInput = {
      status: { in: [TripStatus.SCHEDULED, TripStatus.DRIVER_CONFIRMED] },
      departureTime: { gte: new Date() },
    };

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
   * Cancel a trip (Driver or Admin only)
   */
  async cancelTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driverId !== userId) {
      throw new ForbiddenException('Only the trip driver can cancel this trip');
    }

    return this.prisma.$transaction(async (tx) => {
      // Cancel the trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.CANCELLED },
      });

      // Cancel all bookings and refund
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
            title: 'Trip Cancelled',
            message: `The trip from ${trip.fromCity} to ${trip.toCity} has been cancelled by the driver.`,
          },
        });
      }

      // Clear waitlist
      await tx.waitlist.deleteMany({ where: { tripId } });

      return updatedTrip;
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
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
            waitlists: true,
          },
        },
      },
    });
  }
}

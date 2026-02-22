import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateRatingDto {
  ratedId: string;
  tripId: string;
  score: number;
  review?: string;
}

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a rating (Driver → Passenger or Passenger → Driver)
   * Rules:
   * - Trip must be completed
   * - Rater must have participated in the trip
   * - Can only rate once per trip per person
   * - Score must be 1-5
   */
  async createRating(raterId: string, dto: CreateRatingDto) {
    const { ratedId, tripId, score, review } = dto;

    if (score < 1 || score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    if (raterId === ratedId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    // Verify trip exists and is completed
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          select: { userId: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status !== 'COMPLETED') {
      throw new BadRequestException('You can only rate after the trip is completed');
    }

    // Verify participation
    const participantIds = [
      trip.driverId,
      ...trip.bookings.map((b) => b.userId),
    ];

    if (!participantIds.includes(raterId)) {
      throw new BadRequestException('You did not participate in this trip');
    }

    if (!participantIds.includes(ratedId)) {
      throw new BadRequestException('The rated user did not participate in this trip');
    }

    // Check for duplicate rating
    const existing = await this.prisma.rating.findUnique({
      where: {
        raterId_ratedId_tripId: { raterId, ratedId, tripId },
      },
    });

    if (existing) {
      throw new ConflictException('You have already rated this user for this trip');
    }

    return this.prisma.rating.create({
      data: { raterId, ratedId, tripId, score, review },
      include: {
        rated: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * Get average rating for a user
   */
  async getUserRating(userId: string) {
    const result = await this.prisma.rating.aggregate({
      where: { ratedId: userId },
      _avg: { score: true },
      _count: { score: true },
    });

    const recentReviews = await this.prisma.rating.findMany({
      where: { ratedId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        rater: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
        trip: {
          select: { fromCity: true, toCity: true, departureTime: true },
        },
      },
    });

    return {
      averageScore: result._avg.score ?? 0,
      totalRatings: result._count.score,
      recentReviews,
    };
  }

  /**
   * Get ratings for a specific trip
   */
  async getTripRatings(tripId: string) {
    return this.prisma.rating.findMany({
      where: { tripId },
      include: {
        rater: {
          select: { firstName: true, lastName: true, avatarUrl: true, role: true },
        },
        rated: {
          select: { firstName: true, lastName: true, avatarUrl: true, role: true },
        },
      },
    });
  }
}

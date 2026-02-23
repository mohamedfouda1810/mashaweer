import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async create(
    @CurrentUser('id') raterId: string,
    @Body()
    body: { ratedId: string; tripId: string; score: number; review?: string },
  ) {
    const rating = await this.ratingService.createRating(raterId, body);
    return ApiResponseDto.success(rating, 'Rating submitted');
  }

  @Get('user/:userId')
  async getUserRating(@Param('userId') userId: string) {
    const result = await this.ratingService.getUserRating(userId);
    return ApiResponseDto.success(result);
  }

  @Get('trip/:tripId')
  async getTripRatings(@Param('tripId') tripId: string) {
    const ratings = await this.ratingService.getTripRatings(tripId);
    return ApiResponseDto.success(ratings);
  }
}

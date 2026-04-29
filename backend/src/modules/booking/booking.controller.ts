import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Get,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ── Static routes MUST come before parameterized routes ──

  /**
   * GET /api/bookings/my-bookings
   * Get all bookings for the current user
   */
  @Get('my-bookings')
  async myBookings(@CurrentUser('id') userId: string) {
    const bookings = await this.bookingService.getUserBookings(userId);
    return ApiResponseDto.success(bookings);
  }

  /**
   * GET /api/bookings
   * Alias for my-bookings (backward compat)
   */
  @Get()
  async myBookingsAlias(@CurrentUser('id') userId: string) {
    const bookings = await this.bookingService.getUserBookings(userId);
    return ApiResponseDto.success(bookings);
  }

  /**
   * GET /api/bookings/trip/:tripId
   * Get all bookings for a specific trip
   */
  @Get('trip/:tripId')
  async tripBookings(@Param('tripId') tripId: string) {
    const bookings = await this.bookingService.getTripBookings(tripId);
    return ApiResponseDto.success(bookings);
  }

  /**
   * POST /api/bookings/trips/:tripId
   * Book seat(s) on a trip
   */
  @Post('trips/:tripId')
  async bookSeat(
    @CurrentUser('id') userId: string,
    @Param('tripId') tripId: string,
    @Body('seats') seats?: number,
    @Body('paymentMethod') paymentMethod?: 'WALLET' | 'CASH',
  ) {
    const result = await this.bookingService.bookSeat(
      userId,
      tripId,
      seats || 1,
      paymentMethod || 'CASH',
    );
    return ApiResponseDto.success(result, 'Seat booked successfully');
  }

  /**
   * DELETE /api/bookings/:id
   * Cancel a booking
   */
  @Delete(':id')
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ) {
    const result = await this.bookingService.cancelBooking(userId, bookingId);
    return ApiResponseDto.success(result, 'Booking cancelled');
  }
}

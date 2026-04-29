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

  @Delete(':id')
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ) {
    const result = await this.bookingService.cancelBooking(userId, bookingId);
    return ApiResponseDto.success(result, 'Booking cancelled');
  }

  @Get()
  async myBookings(@CurrentUser('id') userId: string) {
    const bookings = await this.bookingService.getUserBookings(userId);
    return ApiResponseDto.success(bookings);
  }
}

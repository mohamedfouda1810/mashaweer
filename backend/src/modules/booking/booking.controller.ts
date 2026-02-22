import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('trip/:tripId')
  async bookSeat(
    @CurrentUser('id') userId: string,
    @Param('tripId') tripId: string,
    @Body('seats') seats?: number,
  ) {
    const result = await this.bookingService.bookSeat(userId, tripId, seats);
    return ApiResponseDto.success(result, 'Booking processed');
  }

  @Delete(':id')
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id') bookingId: string,
  ) {
    const result = await this.bookingService.cancelBooking(userId, bookingId);
    return ApiResponseDto.success(result, 'Booking cancelled and refunded');
  }

  @Get('my-bookings')
  async myBookings(@CurrentUser('id') userId: string) {
    const bookings = await this.bookingService.getUserBookings(userId);
    return ApiResponseDto.success(bookings);
  }

  @Get('trip/:tripId')
  @Roles('DRIVER', 'ADMIN')
  @UseGuards(RolesGuard)
  async tripBookings(@Param('tripId') tripId: string) {
    const bookings = await this.bookingService.getTripBookings(tripId);
    return ApiResponseDto.success(bookings);
  }
}

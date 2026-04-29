import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto, FilterTripsDto } from './dto/trip.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @Roles('DRIVER', 'ADMIN')
  @UseGuards(RolesGuard)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createTripDto: CreateTripDto,
  ) {
    const trip = await this.tripService.create(userId, createTripDto);
    return ApiResponseDto.success(trip, 'Trip created successfully');
  }

  @Public()
  @Get()
  async findAll(@Query() filters: FilterTripsDto) {
    const result = await this.tripService.findAll(filters);
    return ApiResponseDto.paginated(
      result.trips,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const trip = await this.tripService.findOne(id);
    return ApiResponseDto.success(trip);
  }

  /**
   * POST /api/trips/calculate-pricing
   * Public endpoint — returns authoritative pricing for given distance + seats.
   * Frontend MUST use these values for its slider/display. No local recalculation.
   */
  @Public()
  @Post('calculate-pricing')
  async calculatePricing(
    @Body() body: { distanceKm: number; seats?: number },
  ) {
    const distanceKm = Number(body.distanceKm) || 0;
    const seats = Number(body.seats) || 4;
    if (distanceKm <= 0) {
      return ApiResponseDto.success({
        distanceKm: 0,
        suggestedTripPrice: 0,
        seats,
        suggestedPricePerSeat: 20,
        minPricePerSeat: 20,
        maxPricePerSeat: 85,
        clampedMin: 20,
        clampedMax: 85,
      });
    }
    const pricing = this.tripService.calculatePricing(distanceKm, seats);
    return ApiResponseDto.success(pricing);
  }

  @Delete(':id')
  @Roles('DRIVER', 'ADMIN')
  @UseGuards(RolesGuard)
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const trip = await this.tripService.cancelTrip(id, userId);
    return ApiResponseDto.success(trip, 'Trip cancelled successfully');
  }

  @Post(':id/request-cancel')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async requestCancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
  ) {
    const request = await this.tripService.requestCancellation(id, userId, reason);
    return ApiResponseDto.success(request, 'Cancellation request submitted');
  }

  @Patch(':id/edit')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async editTrip(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: Partial<CreateTripDto>,
  ) {
    const trip = await this.tripService.updateTrip(id, userId, body);
    return ApiResponseDto.success(trip, 'Trip updated successfully');
  }

  @Get('driver/my-trips')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async myTrips(@CurrentUser('id') driverId: string) {
    const trips = await this.tripService.findByDriver(driverId);
    return ApiResponseDto.success(trips);
  }

  @Patch(':id/ready')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async markReady(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const trip = await this.tripService.markDriverReady(id, userId);
    return ApiResponseDto.success(trip, 'Driver marked as ready for trip');
  }

  @Patch(':id/start')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async startTrip(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const trip = await this.tripService.startTrip(id, userId);
    return ApiResponseDto.success(trip, 'Trip started successfully');
  }

  @Patch(':id/complete')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async completeTrip(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const trip = await this.tripService.completeTrip(id, userId);
    return ApiResponseDto.success(trip, 'Trip completed successfully');
  }

  @Patch(':id/status')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: string,
  ) {
    if (status === 'IN_PROGRESS') {
      const trip = await this.tripService.startTrip(id, userId);
      return ApiResponseDto.success(trip, 'Trip started');
    }
    if (status === 'COMPLETED') {
      const trip = await this.tripService.completeTrip(id, userId);
      return ApiResponseDto.success(trip, 'Trip completed successfully');
    }
    return ApiResponseDto.success(null, 'Status update ignored or unsupported');
  }
}

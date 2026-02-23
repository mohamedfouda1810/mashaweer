import {
  Controller,
  Get,
  Post,
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
  @Roles('DRIVER')
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

  @Delete(':id')
  @Roles('DRIVER', 'ADMIN')
  @UseGuards(RolesGuard)
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const trip = await this.tripService.cancelTrip(id, userId);
    return ApiResponseDto.success(trip, 'Trip cancelled successfully');
  }

  @Get('driver/my-trips')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async myTrips(@CurrentUser('id') driverId: string) {
    const trips = await this.tripService.findByDriver(driverId);
    return ApiResponseDto.success(trips);
  }
}

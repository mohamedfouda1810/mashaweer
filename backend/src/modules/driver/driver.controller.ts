import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  /**
   * Driver clicks "I'm Ready" button
   */
  @Post('trips/:tripId/confirm-ready')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async confirmReady(
    @CurrentUser('id') driverId: string,
    @Param('tripId') tripId: string,
  ) {
    const trip = await this.driverService.confirmReady(driverId, tripId);
    return ApiResponseDto.success(trip, 'Readiness confirmed');
  }

  /**
   * Get driver dashboard
   */
  @Get('dashboard')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async dashboard(@CurrentUser('id') driverId: string) {
    const data = await this.driverService.getDashboard(driverId);
    return ApiResponseDto.success(data);
  }

  /**
   * Admin: Mark driver as no-show
   */
  @Post(':driverId/trips/:tripId/no-show')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async markNoShow(
    @Param('driverId') driverId: string,
    @Param('tripId') tripId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.driverService.markNoShow(
      driverId,
      tripId,
      adminId,
    );
    return ApiResponseDto.success(result, 'Driver marked as no-show');
  }
}

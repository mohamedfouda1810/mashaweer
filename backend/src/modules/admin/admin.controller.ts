import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { DriverService } from '../driver/driver.service';
import { WalletService } from '../wallet/wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('admin')
@Roles('ADMIN')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly driverService: DriverService,
    private readonly walletService: WalletService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const stats = await this.adminService.getDashboardStats();
    return ApiResponseDto.success(stats);
  }

  @Get('alerts')
  async alerts(@Query('resolved') resolved?: string) {
    const isResolved = resolved === 'true';
    const alerts = await this.adminService.getAlerts(isResolved);
    return ApiResponseDto.success(alerts);
  }

  @Post('drivers/:driverId/trips/:tripId/no-show')
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

  @Post('users/:userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @Body('reason') reason?: string,
  ) {
    const user = await this.adminService.toggleBan(userId, true, reason);
    return ApiResponseDto.success(user, 'User banned');
  }

  @Post('users/:userId/unban')
  async unbanUser(@Param('userId') userId: string) {
    const user = await this.adminService.toggleBan(userId, false);
    return ApiResponseDto.success(user, 'User unbanned');
  }

  @Get('users')
  async users(
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.adminService.getUsers(
      role,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return ApiResponseDto.paginated(
      result.users,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      result.total,
    );
  }

  @Get('deposits/pending')
  async pendingDeposits() {
    const deposits = await this.walletService.getPendingDeposits();
    return ApiResponseDto.success(deposits);
  }

  @Post('deposits/:id/approve')
  async approveDeposit(
    @Param('id') depositId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.walletService.approveDeposit(depositId, adminId);
    return ApiResponseDto.success(result, 'Deposit approved');
  }

  @Post('deposits/:id/reject')
  async rejectDeposit(
    @Param('id') depositId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.walletService.rejectDeposit(
      depositId,
      adminId,
      reason,
    );
    return ApiResponseDto.success(result, 'Deposit rejected');
  }
}

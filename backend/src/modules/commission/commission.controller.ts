import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionPaymentService } from './commission-payment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller()
export class CommissionController {
  constructor(
    private readonly commissionService: CommissionService,
    private readonly paymentService: CommissionPaymentService,
  ) {}

  // ─── Driver Endpoints ────────────────────────────────────────────────

  @Get('driver/wallet')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async getDriverWallet(@CurrentUser('id') driverId: string) {
    const [commissions, debtSummary, payments] = await Promise.all([
      this.commissionService.getDriverCommissions(driverId),
      this.commissionService.getDriverDebtSummary(driverId),
      this.paymentService.getDriverPayments(driverId),
    ]);

    return ApiResponseDto.success({
      debtSummary,
      commissions,
      payments,
    });
  }

  @Get('driver/commissions')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async getDriverCommissions(@CurrentUser('id') driverId: string) {
    const commissions =
      await this.commissionService.getDriverCommissions(driverId);
    return ApiResponseDto.success(commissions);
  }

  @Get('driver/debt-summary')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async getDriverDebtSummary(@CurrentUser('id') driverId: string) {
    const summary =
      await this.commissionService.getDriverDebtSummary(driverId);
    return ApiResponseDto.success(summary);
  }

  @Post('driver/payment-request')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async submitPaymentRequest(
    @CurrentUser('id') driverId: string,
    @Body()
    body: {
      amount: number;
      instapayReferenceNumber: string;
      screenshotUrl: string;
    },
  ) {
    const payment = await this.paymentService.submitPayment(driverId, {
      amount: body.amount,
      instapayReferenceNumber: body.instapayReferenceNumber,
      screenshotUrl: body.screenshotUrl,
    });
    return ApiResponseDto.success(payment, 'Payment request submitted');
  }

  @Get('driver/payment-history')
  @Roles('DRIVER')
  @UseGuards(RolesGuard)
  async getDriverPayments(@CurrentUser('id') driverId: string) {
    const payments = await this.paymentService.getDriverPayments(driverId);
    return ApiResponseDto.success(payments);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────

  @Get('admin/payment-requests')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getPaymentRequests(@Query('status') status?: string) {
    const payments = status
      ? await this.paymentService.getAllPayments(status)
      : await this.paymentService.getPendingPayments();
    return ApiResponseDto.success(payments);
  }

  @Patch('admin/payment-requests/:id/approve')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async approvePayment(
    @Param('id') paymentId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.paymentService.approvePayment(
      paymentId,
      adminId,
    );
    return ApiResponseDto.success(result, 'Payment approved');
  }

  @Patch('admin/payment-requests/:id/reject')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async rejectPayment(
    @Param('id') paymentId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.paymentService.rejectPayment(
      paymentId,
      adminId,
      reason,
    );
    return ApiResponseDto.success(result, 'Payment rejected');
  }
}

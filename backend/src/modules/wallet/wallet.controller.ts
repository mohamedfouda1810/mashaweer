import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { PaymentMethod } from '@prisma/client';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@CurrentUser('id') userId: string) {
    const wallet = await this.walletService.getOrCreateWallet(userId);
    return ApiResponseDto.success(wallet);
  }

  @Get('balance')
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.walletService.getBalance(userId);
    return ApiResponseDto.success({ balance });
  }

  @Post('deposit')
  async requestDeposit(
    @CurrentUser('id') userId: string,
    @Body()
    body: { amount: number; paymentMethod: PaymentMethod; receiptUrl: string },
  ) {
    const deposit = await this.walletService.createDepositRequest(
      userId,
      body.amount,
      body.paymentMethod,
      body.receiptUrl,
    );
    return ApiResponseDto.success(deposit, 'Deposit request submitted');
  }

  @Get('deposits')
  async myDeposits(@CurrentUser('id') userId: string) {
    const deposits = await this.walletService.getUserDeposits(userId);
    return ApiResponseDto.success(deposits);
  }

  @Get('transactions')
  async myTransactions(@CurrentUser('id') userId: string) {
    const transactions = await this.walletService.getTransactions(userId);
    return ApiResponseDto.success(transactions);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────

  @Get('admin/pending-deposits')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async pendingDeposits() {
    const deposits = await this.walletService.getPendingDeposits();
    return ApiResponseDto.success(deposits);
  }

  @Post('admin/deposits/:id/approve')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async approveDeposit(
    @Param('id') depositId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.walletService.approveDeposit(depositId, adminId);
    return ApiResponseDto.success(result, 'Deposit approved');
  }

  @Post('admin/deposits/:id/reject')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
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

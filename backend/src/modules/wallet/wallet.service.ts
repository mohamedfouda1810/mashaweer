import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DepositStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create wallet for a user
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });
    return wallet ? Number(wallet.balance) : 0;
  }

  /**
   * Create a manual deposit request (InstaPay / Vodafone Cash)
   * User uploads receipt → Admin reviews → Balance added
   */
  async createDepositRequest(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    receiptUrl: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    // Ensure wallet exists
    await this.getOrCreateWallet(userId);

    return this.prisma.depositRequest.create({
      data: {
        userId,
        amount,
        paymentMethod,
        receiptUrl,
        status: DepositStatus.PENDING,
      },
    });
  }

  /**
   * Admin: Approve a deposit request → add balance to wallet
   */
  async approveDeposit(depositId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({
        where: { id: depositId },
      });

      if (!deposit) {
        throw new NotFoundException('Deposit request not found');
      }

      if (deposit.status !== 'PENDING') {
        throw new BadRequestException('This deposit has already been processed');
      }

      // Update deposit status
      await tx.depositRequest.update({
        where: { id: depositId },
        data: {
          status: DepositStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });

      // Add balance to wallet
      const wallet = await tx.wallet.update({
        where: { userId: deposit.userId },
        data: { balance: { increment: Number(deposit.amount) } },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount: Number(deposit.amount),
          status: 'COMPLETED',
          reference: `DEPOSIT-${depositId}`,
          metadata: {
            depositId,
            paymentMethod: deposit.paymentMethod,
            approvedBy: adminId,
          },
        },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: deposit.userId,
          type: 'DEPOSIT_APPROVED',
          title: 'Deposit Approved! 💰',
          message: `Your deposit of ${Number(deposit.amount)} EGP has been approved and added to your wallet.`,
          metadata: { depositId, amount: Number(deposit.amount) },
        },
      });

      return { approved: true, newBalance: Number(wallet.balance) };
    });
  }

  /**
   * Admin: Reject a deposit request
   */
  async rejectDeposit(depositId: string, adminId: string, reason?: string) {
    const deposit = await this.prisma.depositRequest.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit request not found');
    }

    if (deposit.status !== 'PENDING') {
      throw new BadRequestException('This deposit has already been processed');
    }

    await this.prisma.depositRequest.update({
      where: { id: depositId },
      data: {
        status: DepositStatus.REJECTED,
        adminNote: reason,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: deposit.userId,
        type: 'DEPOSIT_REJECTED',
        title: 'Deposit Rejected ❌',
        message: reason
          ? `Your deposit was rejected. Reason: ${reason}`
          : 'Your deposit was rejected. Please contact support.',
        metadata: { depositId },
      },
    });

    return { rejected: true };
  }

  /**
   * Get pending deposit requests (Admin)
   */
  async getPendingDeposits() {
    return this.prisma.depositRequest.findMany({
      where: { status: DepositStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Get deposit history for a user
   */
  async getUserDeposits(userId: string) {
    return this.prisma.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return [];

    return this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}

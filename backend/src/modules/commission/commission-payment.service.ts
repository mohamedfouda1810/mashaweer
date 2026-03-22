import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommissionService } from './commission.service';

@Injectable()
export class CommissionPaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionService: CommissionService,
  ) {}

  /**
   * Driver submits a commission payment request
   */
  async submitPayment(
    driverId: string,
    data: {
      amount: number;
      instapayReferenceNumber: string;
      screenshotUrl: string;
    },
  ) {
    if (data.amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    // Check remaining debt
    const debt = await this.commissionService.getDriverDebtSummary(driverId);
    if (data.amount > debt.remainingDebt) {
      throw new BadRequestException(
        `Payment amount (${data.amount} EGP) exceeds remaining debt (${debt.remainingDebt} EGP).`,
      );
    }

    // Create payment request
    const payment = await this.prisma.commissionPayment.create({
      data: {
        driverId,
        amount: data.amount,
        instapayReferenceNumber: data.instapayReferenceNumber,
        screenshotUrl: data.screenshotUrl,
        status: 'PENDING',
      },
    });

    // Get driver info for notification
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
      select: { firstName: true, lastName: true },
    });

    // Notify all admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'DRIVER_ALERT',
          title: 'New Commission Payment Request 💳',
          message: `Driver ${driver?.firstName} ${driver?.lastName} submitted a commission payment of ${data.amount} EGP via InstaPay (Ref: ${data.instapayReferenceNumber}). Please review.`,
          metadata: {
            paymentId: payment.id,
            driverId,
            amount: data.amount,
          } as any,
        },
      });
    }

    return payment;
  }

  /**
   * Admin approves a payment request
   */
  async approvePayment(paymentId: string, adminId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.commissionPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment request not found');
      }
      if (payment.status !== 'PENDING') {
        throw new BadRequestException('This payment has already been reviewed');
      }

      // Update payment status
      await tx.commissionPayment.update({
        where: { id: paymentId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });

      // Notify driver
      await tx.notification.create({
        data: {
          userId: payment.driverId,
          type: 'COMMISSION_PAYMENT_APPROVED' as any,
          title: 'Commission Payment Approved ✅',
          message: `Your commission payment of ${Number(payment.amount)} EGP has been approved. Thank you!`,
          metadata: { paymentId, amount: Number(payment.amount) } as any,
        },
      });

      return payment;
    });

    // Mark commissions as paid after transaction completes (FIFO)
    await this.commissionService.markCommissionsPaid(
      result.driverId,
      Number(result.amount),
    );

    return { approved: true };
  }

  /**
   * Admin rejects a payment request
   */
  async rejectPayment(paymentId: string, adminId: string, reason?: string) {
    const payment = await this.prisma.commissionPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment request not found');
    }
    if (payment.status !== 'PENDING') {
      throw new BadRequestException('This payment has already been reviewed');
    }

    await this.prisma.commissionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        adminNote: reason || 'Payment rejected by admin',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Notify driver
    await this.prisma.notification.create({
      data: {
        userId: payment.driverId,
        type: 'COMMISSION_PAYMENT_REJECTED',
        title: 'Commission Payment Rejected ❌',
        message: reason
          ? `Your commission payment of ${Number(payment.amount)} EGP was rejected. Reason: ${reason}`
          : `Your commission payment of ${Number(payment.amount)} EGP was rejected. Please contact admin.`,
        metadata: { paymentId, amount: Number(payment.amount) } as any,
      },
    });

    return { rejected: true };
  }

  /**
   * Get all pending payment requests (Admin)
   */
  async getPendingPayments() {
    return this.prisma.commissionPayment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Get all payment requests (Admin, with optional status filter)
   */
  async getAllPayments(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.commissionPayment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
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
   * Get payment history for a driver
   */
  async getDriverPayments(driverId: string) {
    return this.prisma.commissionPayment.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

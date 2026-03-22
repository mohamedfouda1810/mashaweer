import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a commission record after trip completion
   */
  async createTripCommission(
    driverId: string,
    tripId: string,
    tripEarnings: number,
    commissionRate: number,
  ) {
    const amount = Math.round(tripEarnings * commissionRate * 100) / 100;

    return this.prisma.commission.create({
      data: {
        driverId,
        tripId,
        tripEarnings,
        commissionRate,
        amount,
      },
    });
  }

  /**
   * Get all commissions for a driver (ordered newest first)
   */
  async getDriverCommissions(driverId: string) {
    return this.prisma.commission.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        trip: {
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            departureTime: true,
            price: true,
            totalSeats: true,
          },
        },
      },
    });
  }

  /**
   * Get debt summary for a driver
   */
  async getDriverDebtSummary(driverId: string) {
    // Total commission debt (all commissions)
    const allCommissions = await this.prisma.commission.findMany({
      where: { driverId },
      select: { amount: true, isPaid: true },
    });

    const totalDebt = allCommissions.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );
    const paidDebt = allCommissions
      .filter((c) => c.isPaid)
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // Total approved payments
    const approvedPayments = await this.prisma.commissionPayment.findMany({
      where: { driverId, status: 'APPROVED' },
      select: { amount: true },
    });
    const totalPaid = approvedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    // Pending payments
    const pendingPayments = await this.prisma.commissionPayment.findMany({
      where: { driverId, status: 'PENDING' },
      select: { amount: true },
    });
    const totalPending = pendingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const remainingDebt = Math.round((totalDebt - totalPaid) * 100) / 100;

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      remainingDebt: Math.max(0, remainingDebt),
    };
  }

  /**
   * Mark commissions as paid up to a certain amount (FIFO)
   */
  async markCommissionsPaid(driverId: string, amount: number) {
    const unpaidCommissions = await this.prisma.commission.findMany({
      where: { driverId, isPaid: false },
      orderBy: { createdAt: 'asc' },
    });

    let remaining = amount;
    for (const commission of unpaidCommissions) {
      if (remaining <= 0) break;
      const commAmount = Number(commission.amount);
      if (remaining >= commAmount) {
        await this.prisma.commission.update({
          where: { id: commission.id },
          data: { isPaid: true },
        });
        remaining -= commAmount;
      }
    }
  }
}

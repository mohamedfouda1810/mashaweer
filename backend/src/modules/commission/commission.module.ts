import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionPaymentService } from './commission-payment.service';
import { CommissionController } from './commission.controller';

@Module({
  controllers: [CommissionController],
  providers: [CommissionService, CommissionPaymentService],
  exports: [CommissionService, CommissionPaymentService],
})
export class CommissionModule {}

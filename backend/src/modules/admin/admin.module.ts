import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DriverModule } from '../driver/driver.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [DriverModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

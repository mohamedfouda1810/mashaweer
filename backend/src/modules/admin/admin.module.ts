import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DriverModule } from '../driver/driver.module';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationModule } from '../notification/notification.module';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [DriverModule, WalletModule, NotificationModule, forwardRef(() => TripModule)],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CronModule } from './cron/cron.module';
import { TripModule } from './modules/trip/trip.module';
import { BookingModule } from './modules/booking/booking.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { DriverModule } from './modules/driver/driver.module';
import { RatingModule } from './modules/rating/rating.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    PrismaModule,

    // Scheduled Jobs
    CronModule,

    // Feature Modules
    TripModule,
    BookingModule,
    WalletModule,
    DriverModule,
    RatingModule,
    AdminModule,
    NotificationModule,
  ],
})
export class AppModule {}

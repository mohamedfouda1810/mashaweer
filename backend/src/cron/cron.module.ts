import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DriverReadinessCronService } from './driver-readiness.cron';
import { NotificationModule } from '../modules/notification/notification.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule],
  providers: [DriverReadinessCronService],
})
export class CronModule {}

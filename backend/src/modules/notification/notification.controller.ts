import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.notificationService.getUserNotifications(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return ApiResponseDto.paginated(
      result.notifications,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      result.total,
    );
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return ApiResponseDto.success({ count });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.notificationService.markAsRead(id, userId);
    return ApiResponseDto.success(null, 'Notification marked as read');
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return ApiResponseDto.success(null, 'All notifications marked as read');
  }
}

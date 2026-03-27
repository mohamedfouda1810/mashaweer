import { Controller, Post, Delete, Body } from '@nestjs/common';
import { PushService } from './push.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  /**
   * POST /api/push/subscribe
   * Save or update a push subscription for the authenticated user.
   */
  @Post('subscribe')
  async subscribe(
    @CurrentUser('id') userId: string,
    @Body() body: { endpoint: string; p256dh: string; auth: string },
  ) {
    const sub = await this.pushService.saveSubscription(userId, body);
    return ApiResponseDto.success(sub, 'Push subscription saved');
  }

  /**
   * DELETE /api/push/unsubscribe
   * Remove a push subscription by endpoint.
   */
  @Delete('unsubscribe')
  async unsubscribe(@Body() body: { endpoint: string }) {
    await this.pushService.removeSubscription(body.endpoint);
    return ApiResponseDto.success(null, 'Push subscription removed');
  }
}

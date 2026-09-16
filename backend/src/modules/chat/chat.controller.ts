import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('messages')
  async getMessages(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const messages = await this.chatService.getMessages(cursor, Number(limit) || 50);
    return ApiResponseDto.success(messages);
  }

  @Get('status')
  async getStatus(@CurrentUser('id') userId: string) {
    const blocked = await this.chatService.isBlocked(userId);
    return ApiResponseDto.success({ blocked });
  }

  @Delete('messages/:id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteMessage(
    @Param('id') messageId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.chatService.deleteMessage(messageId, adminId);
    this.chatGateway.broadcastMessageDeleted(messageId);
    return ApiResponseDto.success(result, 'Message deleted');
  }

  @Post('block/:userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async blockUser(
    @Param('userId') targetUserId: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.chatService.blockUser(targetUserId, adminId, reason);
    this.chatGateway.broadcastUserBlocked(targetUserId);
    return ApiResponseDto.success(result, 'User blocked from chat');
  }

  @Delete('block/:userId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async unblockUser(
    @Param('userId') targetUserId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.chatService.unblockUser(targetUserId, adminId);
    this.chatGateway.broadcastUserUnblocked(targetUserId);
    return ApiResponseDto.success(result, 'User unblocked');
  }

  @Get('blocked')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getBlockedUsers(@CurrentUser('id') adminId: string) {
    const users = await this.chatService.getBlockedUsers(adminId);
    return ApiResponseDto.success(users);
  }
}

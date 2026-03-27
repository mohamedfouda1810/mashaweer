import { Injectable, Inject, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';
import { NotificationGateway } from './notification.gateway';
import { PushService } from '../push/push.service';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Map notification types to deep-link URLs for push notification click handling.
 */
function getNotificationUrl(type: NotificationType, metadata?: Record<string, any>): string {
  const tripId = metadata?.tripId;
  const bookingId = metadata?.bookingId;

  switch (type) {
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'WAITLIST_PROMOTED':
      return tripId ? `/trips/${tripId}` : '/bookings';
    case 'TRIP_REMINDER':
      return tripId ? `/trips/${tripId}` : '/trips';
    case 'DEPOSIT_APPROVED':
    case 'DEPOSIT_REJECTED':
    case 'COMMISSION_ADDED':
    case 'COMMISSION_PAYMENT_APPROVED':
    case 'COMMISSION_PAYMENT_REJECTED':
      return '/wallet';
    case 'RATING_RECEIVED':
      return tripId ? `/trips/${tripId}` : '/';
    case 'DRIVER_ALERT':
      return '/driver';
    case 'ACCOUNT_BANNED':
      return '/';
    default:
      return tripId ? `/trips/${tripId}` : '/notifications';
  }
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
    @Optional() private readonly pushService?: PushService,
  ) {}

  /**
   * Create a notification (standalone, outside of transactions).
   * Saves to DB → broadcasts via WebSocket → sends web push.
   */
  async create(data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    // Broadcast in real-time via WebSocket
    this.gateway.sendNotificationToUser(data.userId, notification);

    // Send Web Push notification (non-blocking)
    this.sendPush(data).catch(() => {});

    return notification;
  }

  /**
   * Create a notification inside an existing Prisma transaction.
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    data: CreateNotificationDto,
  ) {
    const notification = await tx.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });

    // Broadcast in real-time
    this.gateway.sendNotificationToUser(data.userId, notification);

    // Send Web Push notification (non-blocking)
    this.sendPush(data).catch(() => {});

    return notification;
  }

  /**
   * Internal helper: send web push with deep-link URL.
   */
  private async sendPush(data: CreateNotificationDto) {
    if (!this.pushService) return;
    const url = getNotificationUrl(data.type, data.metadata);
    await this.pushService.sendPushToUser(data.userId, {
      title: data.title,
      body: data.message,
      url,
    });
  }

  /**
   * Get user notifications (paginated)
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}

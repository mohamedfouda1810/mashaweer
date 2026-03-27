import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private isConfigured = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT') || 'mailto:admin@mashaweer.com';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isConfigured = true;
      this.logger.log('Web Push configured with VAPID keys');
    } else {
      this.logger.warn('VAPID keys not configured — push notifications disabled');
    }
  }

  /**
   * Save a push subscription for a user.
   * If the endpoint already exists, update the keys.
   */
  async saveSubscription(userId: string, data: { endpoint: string; p256dh: string; auth: string }) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
      },
      update: {
        userId,
        p256dh: data.p256dh,
        auth: data.auth,
      },
    });
  }

  /**
   * Remove a push subscription.
   */
  async removeSubscription(endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  /**
   * Send a web push notification to all devices of a specific user.
   * Payload includes title, body, icon, and a deep-link URL.
   */
  async sendPushToUser(
    userId: string,
    payload: { title: string; body: string; url?: string; icon?: string },
  ) {
    if (!this.isConfigured) return;

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      data: { url: payload.url || '/' },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload,
        ),
      ),
    );

    // Clean up expired/invalid subscriptions (410 Gone)
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const statusCode = (result.reason as any)?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await this.prisma.pushSubscription.deleteMany({
            where: { endpoint: subscriptions[i].endpoint },
          });
          this.logger.log(`Removed expired subscription for user ${userId}`);
        } else {
          this.logger.warn(
            `Push failed for ${subscriptions[i].endpoint}: ${result.reason}`,
          );
        }
      }
    }
  }
}

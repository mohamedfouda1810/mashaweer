import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

/**
 * ChatGateway handles chat-specific WebSocket events.
 *
 * IMPORTANT: This gateway shares the same Socket.IO Server with
 * NotificationGateway (both use the default namespace '/').
 * Connection auth and room management are handled by NotificationGateway.
 * This gateway ONLY handles @SubscribeMessage events and provides
 * broadcast helpers — NO handleConnection/handleDisconnect.
 */
@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true,
  },
})
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
  ) {}

  @SubscribeMessage('sendChatMessage')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) {
      client.emit('chatError', { message: 'Authentication required to chat.' });
      return;
    }

    try {
      const message = await this.chatService.createMessage(userId, data.content);

      // Broadcast new message to everyone in chat_room
      this.server?.to('chat_room').emit('newChatMessage', message);

      // Notify all OTHER users so their notification bell badge increments
      const senderName = message.user
        ? `${message.user.firstName} ${message.user.lastName}`
        : 'Someone';
      const preview =
        message.content.length > 60
          ? message.content.substring(0, 60) + '…'
          : message.content;

      client.to('chat_room').emit('newNotification', {
        id: `chat-${message.id}`,
        type: 'CHAT_MESSAGE',
        title: `${senderName} in Group Chat`,
        message: preview,
        isRead: false,
        createdAt: message.createdAt,
        metadata: { chatMessageId: message.id },
      });

      return { ok: true, message };
    } catch (err: any) {
      client.emit('chatError', { message: err.message || 'Failed to send message.' });
      return { ok: false, error: err.message || 'Failed to send message.' };
    }
  }

  broadcastMessageDeleted(messageId: string) {
    this.server?.to('chat_room').emit('chatMessageDeleted', { messageId });
  }

  broadcastMessage(message: unknown) {
    this.server?.to('chat_room').emit('newChatMessage', message);
  }

  broadcastUserBlocked(userId: string) {
    this.server?.to('chat_room').emit('chatUserBlocked', { userId });
  }

  broadcastUserUnblocked(userId: string) {
    this.server?.to('chat_room').emit('chatUserUnblocked', { userId });
  }

  /**
   * Emit newNotification to all sockets in chat_room that do NOT belong
   * to excludeUserId (i.e. everyone except the sender).
   */
  broadcastNotificationExcept(excludeUserId: string, payload: Record<string, unknown>) {
    // Fetch all sockets in chat_room then skip the sender's sockets
    this.server?.in('chat_room').fetchSockets().then((sockets) => {
      for (const sock of sockets) {
        if ((sock as any).userId !== excludeUserId) {
          sock.emit('newNotification', payload);
        }
      }
    }).catch(() => {});
  }
}

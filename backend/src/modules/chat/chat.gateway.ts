import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub || payload.id;
      if (!userId) return;

      (client as any).userId = userId;
      (client as any).userRole = payload.role;

      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);

      client.join('chat_room');
      this.logger.log(`User ${userId} joined chat_room (socket ${client.id})`);

    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      let sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets = sockets.filter((id) => id !== client.id);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
    }
  }

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
      this.server.to('chat_room').emit('newChatMessage', message);
      return { ok: true, message };
    } catch (err: any) {
      client.emit('chatError', { message: err.message || 'Failed to send message.' });
      return { ok: false, error: err.message || 'Failed to send message.' };
    }
  }

  broadcastMessageDeleted(messageId: string) {
    this.server.to('chat_room').emit('chatMessageDeleted', { messageId });
  }

  broadcastMessage(message: unknown) {
    this.server.to('chat_room').emit('newChatMessage', message);
  }

  broadcastUserBlocked(userId: string) {
    this.server.to('chat_room').emit('chatUserBlocked', { userId });
  }

  broadcastUserUnblocked(userId: string) {
    this.server.to('chat_room').emit('chatUserUnblocked', { userId });
  }
}

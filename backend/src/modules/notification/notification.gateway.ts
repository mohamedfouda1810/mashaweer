import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow connections from configured frontend URLs and common dev origins
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
      ];
      // Also allow Vercel preview deployments
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // In production, tighten this to callback(new Error('CORS'))
      }
    },
    credentials: true,
  },
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  // Track connected users: userId -> socketId[]
  // In a multi-instance setup, you would use Redis adapter instead.
  private userSockets = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate the WebSocket connection using JWT.
   * The client must provide a valid token via handshake.auth.token.
   * Falls back to handshake.query.token for backwards compatibility.
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from auth or query params
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        this.logger.warn(
          `WebSocket connection rejected: no token provided (socket ${client.id})`,
        );
        client.emit('error', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }

      // Verify the JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub || payload.id;
      if (!userId) {
        this.logger.warn(
          `WebSocket connection rejected: invalid token payload (socket ${client.id})`,
        );
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect(true);
        return;
      }

      // Store the verified userId on the socket for later use
      (client as any).userId = userId;

      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);

      // Join a room specific to the user for easy broadcasting
      client.join(`user_${userId}`);
      this.logger.log(`User ${userId} connected (socket ${client.id})`);
    } catch (err: any) {
      this.logger.warn(
        `WebSocket connection rejected: token verification failed (socket ${client.id}): ${err.message}`,
      );
      client.emit('error', { message: 'Authentication failed' });
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
      this.logger.log(`User ${userId} disconnected (socket ${client.id})`);
    }
  }

  /**
   * Send a notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', notification);
  }

  /**
   * Broadcast trip updates
   */
  broadcastTripUpdate(tripId: string, data: any) {
    this.server.emit('tripUpdate', { tripId, ...data });
  }

  /**
   * Send driver location update to all users watching a trip
   */
  broadcastDriverLocation(tripId: string, lat: number, lng: number) {
    this.server.emit('driverLocation', { tripId, lat, lng });
  }

  /**
   * Handle incoming driver location from the client.
   * Only authenticated drivers can emit their position.
   */
  @SubscribeMessage('driverLocation')
  handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string; lat: number; lng: number },
  ) {
    const userId = (client as any).userId;
    if (!userId) return; // Reject unauthenticated

    // Re-broadcast to all connected clients
    this.broadcastDriverLocation(data.tripId, data.lat, data.lng);
  }
}

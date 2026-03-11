import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected users: userId -> socketId[]
  // In a multi-instance setup, you would use Redis adapter instead.
  private userSockets = new Map<string, string[]>();

  handleConnection(client: Socket) {
    // Expecting userId to be passed in handshake auth or query for simplicity
    const userId = client.handshake.query.userId || client.handshake.auth.userId;

    if (userId && typeof userId === 'string') {
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);
      console.log(`User ${userId} connected. Socket ID: ${client.id}`);
      // Join a room specific to the user for easy broadcasting
      client.join(`user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId || client.handshake.auth.userId;

    if (userId && typeof userId === 'string') {
      let sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets = sockets.filter((id) => id !== client.id);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
      console.log(`User ${userId} disconnected. Socket ID: ${client.id}`);
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
}

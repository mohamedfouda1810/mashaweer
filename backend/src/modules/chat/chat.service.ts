import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(cursor?: string, limit = 50) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const messages = await this.prisma.chatMessage.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
      },
    });
    return messages.map((m) => ({
      id: m.id,
      userId: m.userId,
      content: m.isDeleted ? '[Message deleted]' : m.content,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt,
      user: m.isDeleted ? null : m.user,
    }));
  }

  async createMessage(userId: string, content: string) {
    const trimmed = (content || '').trim();
    if (!trimmed) throw new BadRequestException('Message cannot be empty.');
    if (trimmed.length > 500) throw new BadRequestException('Message is too long. Max 500 characters.');
    const block = await this.prisma.chatBlock.findUnique({ where: { userId } });
    if (block) throw new ForbiddenException('You have been blocked from the group chat by an admin.');
    const message = await this.prisma.chatMessage.create({
      data: { userId, content: trimmed },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
    });
    return { id: message.id, userId: message.userId, content: message.content, isDeleted: message.isDeleted, createdAt: message.createdAt, user: message.user };
  }

  async deleteMessage(messageId: string, adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Only admins can delete messages.');
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found.');
    await this.prisma.chatMessage.update({ where: { id: messageId }, data: { isDeleted: true } });
    return { deleted: true, messageId };
  }

  async blockUser(targetUserId: string, adminId: string, reason?: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Only admins can block users.');
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
    if (!target) throw new NotFoundException('User not found.');
    if (target.role === 'ADMIN') throw new BadRequestException('Cannot block an admin.');
    await this.prisma.chatBlock.upsert({
      where: { userId: targetUserId },
      create: { userId: targetUserId, blockedBy: adminId, reason: reason?.trim() || null },
      update: { blockedBy: adminId, reason: reason?.trim() || null, createdAt: new Date() },
    });
    return { blocked: true, userId: targetUserId };
  }

  async unblockUser(targetUserId: string, adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Only admins can unblock users.');
    const block = await this.prisma.chatBlock.findUnique({ where: { userId: targetUserId } });
    if (!block) throw new NotFoundException('This user is not blocked.');
    await this.prisma.chatBlock.delete({ where: { userId: targetUserId } });
    return { unblocked: true, userId: targetUserId };
  }

  async isBlocked(userId: string): Promise<boolean> {
    const block = await this.prisma.chatBlock.findUnique({ where: { userId } });
    return !!block;
  }

  async getBlockedUsers(adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Only admins can view blocked users.');
    return this.prisma.chatBlock.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

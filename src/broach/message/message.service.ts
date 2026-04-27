import { ForbiddenException, Injectable } from '@nestjs/common';
import { NotificationOwnerType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  // Send message in a chat room
  async sendMessage(params: {
    chatRoomId: string;
    senderId: string;
    content: string;
  }) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId: params.chatRoomId,
          userId: params.senderId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'User is not a participant of this chat room',
      );
    }

    return this.prisma.message.create({
      data: {
        chatRoomId: params.chatRoomId,
        senderId: params.senderId,
        content: params.content,
        senderRole: participant.role,
      },
    });
  }

  async validateRoomAccess(chatRoomId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatRoomId_userId: {
          chatRoomId,
          userId,
        },
      },
    });

    return !!participant;
  }

  // Get messages (paginated)
  async getMessages(params: {
    chatRoomId: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = params.limit ?? 20;

    const messages = await this.prisma.message.findMany({
      where: {
        chatRoomId: params.chatRoomId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
    });

    return {
      messages: messages.reverse(), // Reverse to return in chronological order, older messages first
      nextCursor: messages.length ? messages[messages.length - 1].id : null,
    };
  }
}

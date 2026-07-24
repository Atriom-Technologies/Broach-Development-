import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  // Send message in a chat room
  async sendMessage(params: { chatRoomId: string; senderId: string; content: string }) {
    const [participant, room] = await Promise.all([
      this.prisma.chatParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: params.chatRoomId, userId: params.senderId } },
      }),
      this.prisma.chatRoom.findUnique({
        where: { id: params.chatRoomId },
        select: { status: true },
      }),
    ]);

    if (!participant) {
      throw new ForbiddenException('User is not a participant of this chat room');
    }
    if (room?.status !== 'ACTIVE') {
      throw new ForbiddenException('This conversation has ended.');
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
  async getMessages(params: { chatRoomId: string; cursor?: string; limit?: number }) {
    const limit = params.limit ?? 20;

    const messages = await this.prisma.message.findMany({
      where: { chatRoomId: params.chatRoomId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(params.cursor && { skip: 1, cursor: { id: params.cursor } }),
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;

    const oldestInPage = page[page.length - 1]?.id ?? null;
    return {
      messages: page.reverse(),
      nextCursor: hasMore ? oldestInPage : null,
    };
  }
}

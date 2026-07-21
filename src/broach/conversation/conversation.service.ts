import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatRoomStatus, NotificationOwnerType, NotificationSourceType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates the room + both participants in one transaction.
   * Idempotent: if the room already exists (e.g. org clicks "Resume"
   * which re-hits this), just return it as-is.
   */
  async getOrCreateChatRoom(params: {
    sourceType: NotificationSourceType;
    sourceId: string; // CaseAssignment.id or ServiceAssignment.id
    reporterUserId: string;
    organizationUserId: string;
  }) {
    const existing = await this.prisma.chatRoom.findUnique({
      where: {
        sourceType_sourceId: {
          sourceType: params.sourceType,
          sourceId: params.sourceId,
        },
      },
      include: { participants: true },
    });

    if (existing) return existing;

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.chatRoom.create({
        data: {
          sourceType: params.sourceType,
          sourceId: params.sourceId,
          status: ChatRoomStatus.ACTIVE,
        },
      });

      await tx.chatParticipant.createMany({
        data: [
          { chatRoomId: room.id, userId: params.reporterUserId, role: NotificationOwnerType.REPORTER },
          { chatRoomId: room.id, userId: params.organizationUserId, role: NotificationOwnerType.ORGANIZATION },
        ],
      });

      return tx.chatRoom.findUniqueOrThrow({
        where: { id: room.id },
        include: { participants: true },
      });
    });
  }

  async getRoomBySource(sourceType: NotificationSourceType, sourceId: string) {
    return this.prisma.chatRoom.findUnique({
      where: { sourceType_sourceId: { sourceType, sourceId } },
      include: { participants: true },
    });
  }

  async endConversation(chatRoomId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this chat room.');
    }

    const result = await this.prisma.chatRoom.updateMany({
      where: { id: chatRoomId, status: ChatRoomStatus.ACTIVE },
      data: { status: ChatRoomStatus.CLOSED },
    });

    if (result.count === 0) {
      throw new ForbiddenException('This conversation has already ended.');
    }

    return { chatRoomId, status: ChatRoomStatus.CLOSED };
  }
}

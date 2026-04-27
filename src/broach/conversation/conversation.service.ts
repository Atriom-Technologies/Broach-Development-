import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChatRoomStatus,
  NotificationOwnerType,
  NotificationSourceType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async createChatRoom(params: {
    sourceType: NotificationSourceType;
    sourceId: string;
    reporterId: string;
    organizationId: string;
  }) {
    return this.prisma.chatRoom.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: params.sourceType,
          sourceId: params.sourceId,
        },
      },
      update: {},
      create: {
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        reporterId: params.reporterId,
        organizationId: params.organizationId,
        status: 'ACTIVE',
      },
    });
  }

  async joinConversation(params: {
    sourceType: NotificationSourceType;
    sourceId: string;
    userId: string;
    role: NotificationOwnerType;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.chatRoom.findUnique({
        where: {
          sourceType_sourceId: {
            sourceType: params.sourceType,
            sourceId: params.sourceId,
          },
        },
      });

      if (!room) {
        throw new NotFoundException('Conversation not started yet');
      }

      if (room.status !== ChatRoomStatus.ACTIVE) {
        throw new ForbiddenException('Conversation is not active');
      }

      if (
        params.role === NotificationOwnerType.REPORTER &&
        room.organizationId === params.userId
      ) {
        throw new ForbiddenException('Role mismatch');
      }
      if (
        (params.role === NotificationOwnerType.REPORTER &&
          params.userId !== room.reporterId) ||
        (params.role === NotificationOwnerType.ORGANIZATION &&
          params.userId !== room.organizationId)
      ) {
        throw new ForbiddenException('Not allowed in this conversation');
      }

      await tx.chatParticipant.upsert({
        where: {
          chatRoomId_userId: {
            chatRoomId: room.id,
            userId: params.userId,
          },
        },
        update: {},
        create: {
          chatRoomId: room.id,
          userId: params.userId,
          role: params.role,
        },
      });

      return {
        chatRoomId: room.id,
        role: params.role,
      };
    });
  }
}

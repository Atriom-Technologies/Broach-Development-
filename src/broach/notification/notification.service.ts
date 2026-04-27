import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CaseDetails,
  NotificationOwnerType,
  NotificationSourceType,
  NotificationStatus,
  SupportOrgProfile,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { deriveNotificationCTA } from './notification.utils';
import {
  formatDateHuman,
  humanizeText,
  toProperCaseName,
} from 'src/utils/formatString';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  // Notify new case
  async notifyNewCase(caseDetails: CaseDetails, userId: string) {
    // Fetch all existing organizations
    const orgs: SupportOrgProfile[] =
      await this.prisma.supportOrgProfile.findMany();
    const reporter = await this.prisma.requesterReporterProfile.findUnique({
      where: { userId },
      select: {
        fullName: true,
        profilePicture: true,
      },
    });

    // Fetch case type name
    const caseType = await this.prisma.caseType.findUnique({
      where: { id: caseDetails.caseTypeId },
      select: { name: true },
    });

    // Ensure reporter profile exists
    if (!reporter) {
      throw new Error('Reporter profile not found for notification creation');
    }

    const formattedName = toProperCaseName(reporter.fullName);
    const formattedDate = formatDateHuman(caseDetails.createdAt);
    const formattedCaseType = caseType?.name
      ? humanizeText(caseType.name)
      : 'Unknown';
    // Create notification for these organizations
    await this.prisma.notification.createMany({
      data: orgs.map((org) => ({
        ownerType: NotificationOwnerType.ORGANIZATION,
        ownerId: org.userId,
        sourceType: NotificationSourceType.CASE_REPORT,
        sourceId: caseDetails.id,
        status: NotificationStatus.PENDING,
        data: {
          date: formattedDate,
          profilePicture: reporter?.profilePicture,
          reporterName: formattedName,
          type: formattedCaseType,
        },
      })),
    });
  }

  // Get notification for Reporter or Organization
  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });
    // Load chat rooms once to avoid N+1
    const chatRoomMap = new Map();
    const chatRooms = await this.prisma.chatRoom.findMany({
      where: { sourceId: { in: notifications.map((n) => n.sourceId) } },
    });
    chatRooms.forEach((c) => chatRoomMap.set(c.sourceId, c));

    return notifications.map((n) => ({
      ...n,
      ctas: deriveNotificationCTA(n, chatRoomMap.get(n.sourceId)),
    }));
  }

  // Contact Reporter action
  async contactReporter(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    if (notification.ownerType !== NotificationOwnerType.ORGANIZATION) {
      throw new BadRequestException('Only Organizations can contact reporter');
    }

    if (notification.status !== NotificationStatus.PENDING) {
      throw new BadRequestException('Conversation already started');
    }

    // fetch case + reporter (source of truth)
    const caseDetails = await this.prisma.caseDetails.findUnique({
      where: { id: notification.sourceId },
      include: {
        requesterReporterProfile: true,
      },
    });

    if (!caseDetails?.requesterReporterProfile) {
      throw new Error('Reporter not found');
    }

    // 1. CREATE CHAT ROOM via ConversationService
    const chatRoom = await this.conversationService.createChatRoom({
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      reporterId: caseDetails.requesterReporterProfile.userId,
      organizationId: userId,
    });

    // 2. ORGANIZATION JOINS via ConversationService
    await this.conversationService.joinConversation({
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      userId,
      role: NotificationOwnerType.ORGANIZATION,
    });

    // 3. UPDATE NOTIFICATIONS ONLY (state responsibility)
    await this.prisma.notification.updateMany({
      where: {
        sourceType: notification.sourceType,
        sourceId: notification.sourceId,
        status: NotificationStatus.PENDING,
      },
      data: {
        status: NotificationStatus.IN_DISCUSSION,
      },
    });

    // 4. Create reporter notification
    await this.prisma.notification.create({
      data: {
        ownerType: NotificationOwnerType.REPORTER,
        ownerId: caseDetails.requesterReporterProfile.userId,
        sourceType: NotificationSourceType.CASE_REPORT,
        sourceId: caseDetails.id,
        status: NotificationStatus.IN_DISCUSSION,
        data: {
          caseType: caseDetails.caseTypeId,
          date: caseDetails.createdAt,
        },
      },
    });

    return {
      chatRoomId: chatRoom.id,
      message: 'Chat started',
    };
  }
  // Response to conversation initiated by organization
  async respondToConversation(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.ownerType !== NotificationOwnerType.REPORTER) {
      throw new BadRequestException('Only reporter can respond');
    }

    if (notification.status !== NotificationStatus.IN_DISCUSSION) {
      throw new BadRequestException('Conversation not active');
    }

    const chatRoom = await this.conversationService.joinConversation({
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      userId,
      role: NotificationOwnerType.REPORTER,
    });

    return {
      chatRoomId: chatRoom.chatRoomId,
      message: 'Joined conversation',
    };
  }

  async endConversation(notificationId: string, userId: string) {
    // 1. Find the notification
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: {
        ownerId: true,
        sourceType: true,
        sourceId: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // 2. Check ownership (actor must be owner of this notification)
    if (notification.ownerId !== userId) {
      throw new ForbiddenException(
        'Only participants can end this conversation',
      );
    }

    // 3. Update status to CLOSED
    await this.prisma.notification.updateMany({
      where: {
        sourceType: notification.sourceType,
        sourceId: notification.sourceId,
        status: { not: 'CLOSED' },
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // // 4. Optional: mark chatRoom as inactive (for clarity)
    // await this.prisma.chatRoom.updateMany({
    //   where: {
    //     sourceType: notification.sourceType,
    //     sourceId: notification.sourceId,
    //   },
    //   data: {
    //     // optional flag like isActive = false
    //   },
    // });

    // 5. Optional: schedule deletion in 2 days (depends on your job system)

    return { message: 'Conversation ended', status: 'CLOSED' };
  }

  // async scheduleAutoRemoveClosedNotifications() {
  //   const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  //   // Find notifications that were closed more than 2 days ago
  //   const notificationsToDelete = await this.prisma.notification.findMany({
  //     where: {
  //       status: 'CLOSED',
  //       closedAt: { lte: twoDaysAgo },
  //     },
  //   });

  //   const sourceIds = notificationsToDelete.map((n) => n.sourceId);

  //   // Delete notifications
  //   await this.prisma.notification.deleteMany({
  //     where: { sourceId: { in: sourceIds } },
  //   });

  //   // Optionally delete chat rooms if needed
  //   await this.prisma.chatRoom.deleteMany({
  //     where: { sourceId: { in: sourceIds } },
  //   });

  //   return { deletedNotifications: notificationsToDelete.length };
  // }

  // async sendMessage(
  //   chatRoomId: string,
  //   userId: string,
  //   senderType: NotificationOwnerType,
  //   content: string,
  // ) {
  //   // Validate chat room exists
  //   const chatRoom = await this.prisma.chatRoom.findUnique({
  //     where: { id: chatRoomId },
  //   });

  //   if (!chatRoom) {
  //     throw new NotFoundException(
  //       'No message thread found for this conversation',
  //     );
  //   }

  //   // Create message
  //   const newMessage = await this.prisma.message.create({
  //     data: {
  //       chatRoomId,
  //       senderId: userId,
  //       senderType,
  //       content,
  //     },
  //   });
  //   return newMessage;
  // }

  // Fetch all mesages for a chat room
  async getChatHistory(chatRoomId: string) {
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' }, // oldest first
    });
  }
}

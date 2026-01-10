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

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

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
  async contactReporter(notificationId: string, actionId: string) {
    // Find the notification
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    // Make sure only ORganization can contact reporter
    if (notification.ownerType !== NotificationOwnerType.ORGANIZATION)
      throw new BadRequestException('Only Organizations can contact reporter');

    // Ensure status is PENDING
    if (notification.status !== NotificationStatus.PENDING) {
      throw new BadRequestException('Conversation already started');
    }

    // Check if chatROom already exists
    let chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        sourceType: notification.sourceType,
        sourceId: notification.sourceId,
      },
    });

    // Create chat Room if it does not exist
    if (!chatRoom) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          sourceType: notification.sourceType,
          sourceId: notification.sourceId,
          orgJoined: true,
          reporterJoined: false,
        },
      });
    } else if (!chatRoom.orgJoined) {
      // Ensuring organization is marked as joined
      chatRoom = await this.prisma.chatRoom.update({
        where: { id: chatRoom.id },
        data: { orgJoined: true },
      });
    }

    // Update all Orgs noitification flags for this source
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

    // 7. Create reporter notification (FIRST TIME)
    const caseDetails = await this.prisma.caseDetails.findUnique({
      where: { id: notification.sourceId },
      include: {
        requesterReporterProfile: { include: { user: true } },
      },
    });

    // Ensure case details exist
    if (!caseDetails) {
      throw new Error('Case not found');
    }

    // Fetch reporter profile
    const reporterProfile =
      await this.prisma.requesterReporterProfile.findUnique({
        where: { userId: caseDetails.requesterReporterProfile?.userId },
      });

    // Ensure reporter profile exists
    if (!reporterProfile) {
      throw new Error('Reporter profile not found');
    }
    // Create notification for the Reporter
    await this.prisma.notification.create({
      data: {
        ownerType: NotificationOwnerType.REPORTER,
        ownerId: reporterProfile.userId,
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
  async respondToConversation(notificationId: string, actionId: string) {
    // Find the notification
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    // Make sure only reporter can respond
    if (notification.ownerType !== NotificationOwnerType.REPORTER)
      throw new BadRequestException('Only Reporter can respond');

    // Ensure status is IN_DISCUSSION
    if (notification.status !== NotificationStatus.IN_DISCUSSION) {
      throw new BadRequestException('Conversation not active');
    }

    // Make sure conversation already exists or started
    const chatRoom = await this.prisma.chatRoom.findFirst({
      where: {
        sourceType: notification.sourceType,
        sourceId: notification.sourceId,
      },
    });

    if (!chatRoom || !chatRoom.orgJoined)
      throw new BadRequestException('Conversation has not been started yet');

    // Mark reporter as Joined (Indempotent)
    if (!chatRoom.reporterJoined) {
      await this.prisma.chatRoom.update({
        where: { id: chatRoom.id },
        data: { reporterJoined: true },
      });
    }

    return {
      chatRoomId: chatRoom.id,
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

    // 4. Optional: mark chatRoom as inactive (for clarity)
    await this.prisma.chatRoom.updateMany({
      where: {
        sourceType: notification.sourceType,
        sourceId: notification.sourceId,
      },
      data: {
        // optional flag like isActive = false
      },
    });

    // 5. Optional: schedule deletion in 2 days (depends on your job system)

    return { message: 'Conversation ended', status: 'CLOSED' };
  }

  async scheduleAutoRemoveClosedNotifications() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Find notifications that were closed more than 2 days ago
    const notificationsToDelete = await this.prisma.notification.findMany({
      where: {
        status: 'CLOSED',
        closedAt: { lte: twoDaysAgo },
      },
    });

    const sourceIds = notificationsToDelete.map((n) => n.sourceId);

    // Delete notifications
    await this.prisma.notification.deleteMany({
      where: { sourceId: { in: sourceIds } },
    });

    // Optionally delete chat rooms if needed
    await this.prisma.chatRoom.deleteMany({
      where: { sourceId: { in: sourceIds } },
    });

    return { deletedNotifications: notificationsToDelete.length };
  }
}

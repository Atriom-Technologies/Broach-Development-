import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CaseDetails,
  NotificationOwnerType,
  NotificationSourceType,
  NotificationStatus,
  SupportOrgProfile,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { deriveNotificationCTA } from './notification.utils';
import { formatDateHuman, humanizeText, toProperCaseName } from 'src/utils/formatString';
import { ConversationService } from '../conversation/conversation.service';
import { AppLogger } from 'src/logger/logger.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(NotificationService.name);
  }

  // Notify new case
  async notifyNewCase(caseDetails: CaseDetails, requesterReporterProfileId: string) {
    const [orgs, reporter, caseType] = await Promise.all([
      this.prisma.supportOrgProfile.findMany({ select: { userId: true } }),
      this.prisma.requesterReporterProfile.findUnique({
        where: { id: requesterReporterProfileId },
        select: { fullName: true, profilePicture: true },
      }),
      this.prisma.caseType.findUnique({
        where: { id: caseDetails.caseTypeId },
        select: { name: true },
      }),
    ]);

    if (!reporter) {
      throw new Error(
        `Reporter profile ${requesterReporterProfileId} not found while notifying orgs for case ${caseDetails.id}`,
      );
    }

    if (orgs.length === 0) {
      this.logger.warn(`No organizations registered — skipping notification for case ${caseDetails.id}`);
      return;
    }

    const formattedName = toProperCaseName(reporter.fullName);
    const formattedDate = formatDateHuman(caseDetails.createdAt);
    const formattedCaseType = caseType?.name ? humanizeText(caseType.name) : 'Unknown';

    await this.prisma.notification.createMany({
      data: orgs.map((org) => ({
        ownerType: NotificationOwnerType.ORGANIZATION,
        ownerId: org.userId,
        sourceType: NotificationSourceType.CASE_REPORT,
        sourceId: caseDetails.id,
        status: NotificationStatus.PENDING,
        data: {
          date: formattedDate,
          profilePicture: reporter.profilePicture,
          reporterName: formattedName,
          type: formattedCaseType,
        },
      })),
    });
  }
}

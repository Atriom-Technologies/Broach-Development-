import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SafeExecutor } from 'src/utils/safe-execute';
import { CreateCaseDto } from './dto/create-case.dto';
import { NotificationSourceType, Prisma, UserType } from '@prisma/client';
import { CaseRepository } from './repository/case.repository';
import { CursorPaginationDto } from './dto/pagination.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CASE_REPORT_JOB, NOTIFICATION_JOB_OPTS, NOTIFICATION_QUEUE } from 'src/shared/constant/case.constants';
import { AppLogger } from 'src/logger/logger.service';
import { CaseListItem } from './types';
import { ConversationService } from '../conversation/conversation.service';
@Injectable()
export class CasesService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly caseReportQueue: Queue,
    private readonly repo: CaseRepository,
    private readonly safeExecutor: SafeExecutor,
    private readonly logger: AppLogger,
    private readonly conversationService: ConversationService,
  ) {
    this.logger.setContext(CasesService.name);
  }

  // Submit a case
  async createCase(dto: CreateCaseDto, userId: string) {
    const user = await this.repo.findUserById(userId);
    const caseTypedto = dto.typeOfAssaultId;

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} does not exist.`);
    }

    // Handle incorrect account permissions (403 Forbidden)
    // if (user.userType !== UserType.requester_reporter) {
    //   throw new ForbiddenException('You cannot submit a case. Invalid user type!');
    // }

    // Handle an incomplete registration profile (403 Forbidden or 400 Bad Request)
    if (!user.requesterReporterProfile) {
      throw new ForbiddenException('Requester profile not found. Please complete registration!');
    }

    // Check if case type ID from front end is valid. Case type id is expected to be sent from client
    // Note: Type of assault labeled in UI form is regarded as caseType in the database
    const caseType = await this.repo.findCaseTypeById(caseTypedto);

    if (!caseType) {
      throw new BadRequestException('Please select a valid case type.');
    }

    /**
     * Case report and can be submitted without the victim details
     * victim details is option when a field like self is selected from the drop down menu
     * so if condition handles the business variant
     */
    // Safely extract the ID from the DTO
    if (dto.victimDetails) {
      const vulnerabilityStatusId = dto.victimDetails?.vulnerabilityStatusId;
      if (!vulnerabilityStatusId) {
        throw new BadRequestException('Invalid type. Please select a valid vulnerable status.');
      }

      // Run the lookup AND capture the return value
      const vulnerabilityStatus = await this.repo.findVulnerabilityStatusById(vulnerabilityStatusId);
      // Physically block the execution if the database returns null
      if (!vulnerabilityStatus) {
        throw new BadRequestException('The selected vulnerability status does not exist.');
      }
    }

    // Build the data to be created
    const data: Prisma.CaseDetailsCreateInput = {
      requesterReporterProfile: { connect: { id: user.requesterReporterProfile.id } },
      caseType: { connect: { id: caseType.id } },
      whoIsReporting: dto.whoIsReporting,
      location: dto.location,
      description: dto.description,
      infoConfirmed: dto.infoConfirmed,

      ...(dto.victimDetails && {
        victimDetails: {
          create: {
            ageRange: dto.victimDetails.ageRange,
            employmentStatus: dto.victimDetails.employmentStatus,
            gender: dto.victimDetails.gender,
            vulnerabilityStatusId: dto.victimDetails.vulnerabilityStatusId,
          },
        },
      }),

      ...(dto.assailantDetails && {
        assailantDetails: {
          create: {
            noOfAssailants: dto.assailantDetails.noOfAssailants,
            gender: dto.assailantDetails.gender,
            ageRange: dto.assailantDetails.ageRange,
          },
        },
      }),
    };

    // Create case via repo
    const caseDetails = await this.repo.createCase({
      data,
      include: {
        requesterReporterProfile: { include: { user: true } },
        caseType: true,
        victimDetails: true,
        assailantDetails: true,
      },
    });

    // push to upstash/redis
    try {
      await this.caseReportQueue.add(
        CASE_REPORT_JOB,
        { caseId: caseDetails.id, userId: user.requesterReporterProfile.id },
        NOTIFICATION_JOB_OPTS,
      );
    } catch (err) {
      this.logger.error(`Failed to enqueue notification for case ${caseDetails.id}`);
    }

    return { success: true, caseId: caseDetails.id };
  }

  async getCaseById(id: string) {
    // get the case by id and check if deleted is null
    // if so, throw not found exception
    const caseDetails = await this.repo.getCaseById(id);

    if (!caseDetails) throw new NotFoundException(`Case not found`);

    return {
      id: caseDetails.id,
      name: caseDetails.requesterReporterProfile?.fullName,
      profilePicture: caseDetails.requesterReporterProfile?.profilePicture,
      caseType: caseDetails.caseType,
      description: caseDetails.description,
      createdAt: caseDetails.createdAt,
    };
  }

  async getAllCases(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const cases = await this.repo.getAllCases(limit, cursor);

    if (!cases.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = cases.length > limit;
    const items = hasNextPage ? cases.slice(0, limit) : cases;

    return {
      data: items.map((item) => this.toCaseSummary(item)),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

  async getReporterCaseHistory(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const cases = await this.repo.getAllCases(limit, cursor);

    if (!cases.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = cases.length > limit;
    const items = hasNextPage ? cases.slice(0, limit) : cases;

    return {
      data: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        orgLogo: item.claimedByOrganization?.organizationLogoUrl || 'NA',
        orgName: item.claimedByOrganization?.organizationName || 'NA',
        caseType: item.caseType.name,
      })),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

  async getOrgCaseHistory(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const cases = await this.repo.getAllCases(limit, cursor);

    if (!cases.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = cases.length > limit;
    const items = hasNextPage ? cases.slice(0, limit) : cases;

    return {
      data: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        profilePicture: item.requesterReporterProfile?.profilePicture || 'NA',
        fullName: item.requesterReporterProfile?.fullName || 'NA',
        caseType: item.caseType,
      })),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

  async getCaseForOrg(caseId: string, organizationId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(organizationId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }

    const [caseDetails, assignment] = await Promise.all([
      this.repo.getCaseById(caseId),
      this.repo.getAssignmentForOrg(caseId, organizationId),
    ]);

    if (!caseDetails) throw new NotFoundException('Case not found.');

    return {
      id: caseDetails.id,
      caseType: caseDetails.caseType,
      description: caseDetails.description,
      caseStatus: caseDetails.caseStatus,
      claimedByOrganizationId: caseDetails.claimedByOrganizationId,
      isClaimedByMe: caseDetails.claimedByOrganizationId === organizationId,
      myAssignmentStatus: assignment?.status ?? null, // null = this org hasn't interacted with it yet
    };
  }

  async getCaseForReporter(caseId: string, requesterReporterProfileId: string) {
    const caseDetails = await this.repo.getCaseByIdForReporter(caseId, requesterReporterProfileId);
    if (!caseDetails) throw new NotFoundException('Case not found.');

    return {
      id: caseDetails.id,
      description: caseDetails.description,
      caseStatus: caseDetails.caseStatus,
    };
  }

  async claimCase(caseId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.claimCase(caseId, orgProfile.id);
  }

  async contactReporter(caseId: string, orgId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(orgId);

    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    // Step 1: claim (atomic, race-safe — as already built)
    await this.repo.claimCase(caseId, orgProfile.id);

    // Step 2: resolve both users needed for the room
    const context = await this.repo.getContactContext(caseId, orgProfile.id);
    if (!context) {
      throw new NotFoundException('Case or assignment not found after claiming.');
    }

    // Step 3: create the room (idempotent — safe even if retried)
    const room = await this.conversationService.getOrCreateChatRoom({
      sourceType: NotificationSourceType.CASE_REPORT,
      sourceId: context.assignment.id,
      reporterUserId: context.reporterUserId,
      organizationUserId: context.organizationUserId,
    });

    return { chatRoomId: room.id, caseStatus: 'in_discussion' as const };
  }

  async respondToCase(caseId: string, userId: string) {
    const assignmentId = await this.getActiveAssignmentIdForReporter(caseId, userId);

    const room = await this.conversationService.getRoomBySource(NotificationSourceType.CASE_REPORT, assignmentId);

    if (!room) {
      throw new NotFoundException('No conversation has been started for this case yet.');
    }

    return { chatRoomId: room.id };
  }

  async rejectCase(caseId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.rejectCase(caseId, orgProfile.id);
  }

  async resolveCase(caseId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.resolveCase(caseId, orgProfile.id);
  }

  async withdrawCase(caseId: string, userId: string) {
    const reporterProfile = await this.repo.getRequesterReporterProfileByUserId(userId);
    if (!reporterProfile) {
      throw new ForbiddenException('No reporter profile found for this account.');
    }
    return this.repo.withdrawCase(caseId, reporterProfile.id);
  }

  async getContactContext(caseId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }

    const context = await this.repo.getContactContext(caseId, orgProfile.id);
    if (!context) {
      throw new NotFoundException('Case or assignment not found.');
    }

    return context; // { assignment: { id, status }, reporterUserId, organizationUserId }
  }

  async getActiveAssignmentIdForReporter(caseId: string, userId: string) {
    const reporterProfile = await this.repo.getRequesterReporterProfileByUserId(userId);
    if (!reporterProfile) {
      throw new ForbiddenException('No reporter profile found for this account.');
    }

    const assignmentId = await this.repo.getActiveAssignmentId(caseId, reporterProfile.id);
    if (!assignmentId) {
      throw new NotFoundException('No active conversation for this case yet.');
    }

    return assignmentId;
  }
  async updateCase(id: string, userId: string, dto: UpdateCaseDto) {
    const data: Prisma.CaseDetailsUpdateInput = {
      // Top level fields
      whoIsReporting: dto.whoIsReporting,
      caseType: dto.typeOfAssaultId ? { connect: { id: dto.typeOfAssaultId } } : undefined,
      location: dto.location,
      description: dto.description,
      infoConfirmed: dto.infoConfirmed,

      // Nested victimDetails update
      ...(dto.victimDetails && {
        victimDetails: {
          update: {
            ageRange: dto.victimDetails.ageRange,
            employmentStatus: dto.victimDetails.employmentStatus,
            gender: dto.victimDetails.gender,
            vulnerabilityStatus: dto.victimDetails.vulnerabilityStatusId
              ? { connect: { id: dto.victimDetails.vulnerabilityStatusId } }
              : undefined,
          },
        },
      }),
      // Nested assailantDetails update
      ...(dto.assailantDetails && {
        assailantDetails: {
          update: {
            noOfAssailants: dto.assailantDetails.noOfAssailants,
            gender: dto.assailantDetails.gender,
            ageRange: dto.assailantDetails.ageRange,
          },
        },
      }),
    };
    return this.safeExecutor.run(() => this.repo.updateCase(id, userId, data), `Failed to update case with ID: ${id}`);
  }

  async softDeleteCase(id: string, userId: string) {
    const user = await this.repo.findUserById(userId);

    const [report, reporter] = await Promise.all([this.repo.getCaseById(id), user?.requesterReporterProfile?.id]);

    // If case doesn't exist or already deleted
    if (!report) {
      throw new NotFoundException(`Case not found or already deleted`);
    }

    // If the user making request doesn't exist (shouldn't happen normally)
    if (!reporter) throw new ForbiddenException(`Invalid user trying to delete this resource`);

    // Ownership
    if (report?.requesterReporterProfile?.id !== userId)
      throw new ForbiddenException(`You cannot delete this resource`);

    return this.safeExecutor.run(() => this.repo.softDeleteCase(id, userId), `Failed to delete case: ${id}`);
  }

  private toCaseSummary(item: CaseListItem) {
    return {
      id: item.id,
      description: item.description,
      createdAt: item.createdAt,
      caseType: item.caseType?.name ?? null,
      reporterId: item.requesterReporterProfile?.id ?? null,
      reporterFullName: item.requesterReporterProfile?.fullName ?? null,
      reporterProfilePicture: item.requesterReporterProfile?.profilePicture ?? null,
    };
  }
}

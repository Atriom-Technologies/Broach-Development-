import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SafeExecutor } from 'src/utils/safe-execute';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { NotificationSourceType, Prisma, UserType } from '@prisma/client';
import { ServiceRepository } from './service-repository/service.repository';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AppLogger } from 'src/logger/logger.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { NOTIFICATION_JOB_OPTS, NOTIFICATION_QUEUE, SERVICE_REQUEST_JOB } from 'src/shared/constant/case.constants';
import { ServiceRequestListItem } from './types';
import { CursorPaginationDto } from './dto/pagination.dto';
import { ConversationService } from '../conversation/conversation.service';
@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly serviceRequestQueue: Queue,

    private readonly safeExecutor: SafeExecutor,
    private readonly repo: ServiceRepository,
    private readonly logger: AppLogger,
    private readonly conversationService: ConversationService,
  ) {
    this.logger.setContext(ServiceRequestService.name);
  }

  // Create a new service request
  async createServiceRequest(dto: BioDetailsDto, userId: string) {
    const user = await this.repo.findUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} does not exist.`);
    }

    if (user.userType !== UserType.requester_reporter) {
      throw new ForbiddenException('Not authorized to request a service.');
    }

    if (!user.requesterReporterProfile) {
      throw new BadRequestException('Please complete your profile before requesting a service.');
    }

    const data: Prisma.ServiceRequestsCreateInput = {
      requesterReporterProfile: { connect: { id: user.requesterReporterProfile.id } },
      whoNeedsThisService: dto.whoNeedsThisService,
      ageRange: dto.ageRange,
      phone: dto.phone,
      email: dto.email,
      infoConfirmed: dto.infoConfirmed,

      ...(dto.serviceDetails && {
        serviceDetails: {
          create: {
            serviceType: { connect: { id: dto.serviceDetails.serviceTypeId } },
            vulnerabilityStatus: { connect: { id: dto.serviceDetails.vulnerabilityStatusId } },
            maritalStatus: dto.serviceDetails.maritalStatus,
            workStatus: dto.serviceDetails.workStatus,
            description: dto.serviceDetails.description,
          },
        },
      }),
    };

    const serviceType = await this.repo.findServiceTypeById(dto.serviceDetails.serviceTypeId);
    if (!serviceType) {
      throw new BadRequestException('The selected service type does not exist.');
    }

    // 2. Verify Vulnerability Status exists
    const vulnerabilityStatus = await this.repo.findVulnerabilityStatusById(dto.serviceDetails.vulnerabilityStatusId);
    if (!vulnerabilityStatus) {
      throw new BadRequestException('The selected vulnerability status does not exist.');
    }

    const serviceRequest = await this.repo.createServiceRequest({
      data,
      include: { requesterReporterProfile: { include: { user: true } }, serviceDetails: true },
    });

    try {
      await this.serviceRequestQueue.add(
        SERVICE_REQUEST_JOB,
        { requestId: serviceRequest.id, requesterReporterProfileId: user.requesterReporterProfile.userId },
        NOTIFICATION_JOB_OPTS,
      );
    } catch (err) {
      this.logger.error(`Failed to enqueue notification for service request ${serviceRequest.id}`);
    }

    return {
      success: true,
      requestId: serviceRequest.id,
    };
  }

  // Fetch a service request by ID
  async getServiceRequest(id: string) {
    return this.safeExecutor.run(
      () => this.repo.getServiceRequestById(id),
      `Failed to fetch service request id: ${id}`,
    );
  }

  async getReporterServiceHistory(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const cases = await this.repo.getAllServiceRequests(limit, cursor);

    if (!cases.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = cases.length > limit;
    const items = hasNextPage ? cases.slice(0, limit) : cases;

    return {
      data: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        orgLogo: item.claimedByOrganization?.organizationLogoUrl || 'NA',
        orgName: item.claimedByOrganization?.organizationName || 'NA',
        caseType: item.serviceDetails?.serviceType.name,
      })),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

  async getOrgServicesHistory(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const cases = await this.repo.getAllServiceRequests(limit, cursor);

    if (!cases.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = cases.length > limit;
    const items = hasNextPage ? cases.slice(0, limit) : cases;

    return {
      data: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        profilePicture: item.requesterReporterProfile?.profilePicture || 'NA',
        fullName: item.requesterReporterProfile?.fullName || 'NA',
        caseType: item.serviceDetails?.serviceType.name,
      })),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

  // Fetch all service requests
  // async getAllServiceRequests(pagination: CursorPaginationDto) {
  //   const { cursor, limit } = pagination;

  //   const requests = await this.repo.getAllServiceRequests(limit, cursor);

  //   if (!requests.length) throw new NotFoundException('No Data Available.');

  //   const hasNextPage = requests.length > limit;
  //   const items = hasNextPage ? requests.slice(0, limit) : requests;

  //   return {
  //     data: items.map((item) => this.toServiceRequestSummary(item)),
  //     meta: {
  //       hasNextPage,
  //       nextCursor: hasNextPage ? items[items.length - 1].id : null,
  //     },
  //   };
  // }
  async getServiceForOrg(serviceId: string, organizationId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(organizationId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }

    const [serviceRequest, assignment] = await Promise.all([
      this.repo.getServiceRequestById(serviceId),
      this.repo.getAssignmentForOrg(serviceId, organizationId),
    ]);

    if (!serviceRequest) throw new NotFoundException('Service not found.');

    return {
      id: serviceRequest.id,
      serviceType: serviceRequest.serviceType,
      description: serviceRequest.description,
      requestStatus: serviceRequest.caseStatus,
      claimedByOrganizationId: serviceRequest.claimedByOrganizationId,
      isClaimedByMe: serviceRequest.claimedByOrganizationId === organizationId,
      myAssignmentStatus: assignment?.status ?? null, // null = this org hasn't interacted with it yet
    };
  }

  // async getServiceForReporter(serviceId: string, requesterReporterProfileId: string) {
  //   const caseDetails = await this.repo.getServiceByIdForReporter(serviceId, requesterReporterProfileId);
  //   if (!caseDetails) throw new NotFoundException('Case not found.');

  //   return {
  //     id: caseDetails.id,
  //     description: caseDetails.description,
  //     caseStatus: caseDetails.caseStatus,
  //   };
  // }

  private toServiceRequestSummary(item: ServiceRequestListItem) {
    return {
      id: item.id,
      createdAt: item.createdAt,
      description: item.serviceDetails?.description ?? null,
      serviceType: item.serviceDetails?.serviceType?.name ?? null,
      requester: item.requesterReporterProfile
        ? {
            fullName: item.requesterReporterProfile.fullName,
            profilePicture: item.requesterReporterProfile.profilePicture,
          }
        : null,
    };
  }

  async claimService(serviceId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.claimService(serviceId, orgProfile.id);
  }

  async contactReporter(serviceId: string, orgId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(orgId);

    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    // Step 1: claim (atomic, race-safe — as already built)
    await this.repo.claimService(serviceId, orgProfile.id);

    // Step 2: resolve both users needed for the room
    const context = await this.repo.getContactContext(serviceId, orgProfile.id);
    if (!context) {
      throw new NotFoundException('Case or assignment not found after claiming.');
    }

    // Step 3: create the room (idempotent — safe even if retried)
    const room = await this.conversationService.getOrCreateChatRoom({
      sourceType: NotificationSourceType.SERVICE_REQUEST,
      sourceId: context.assignment.id,
      reporterUserId: context.reporterUserId,
      organizationUserId: context.organizationUserId,
    });

    return { chatRoomId: room.id, caseStatus: 'in_discussion' as const };
  }

  async respondToCase(serviceId: string, userId: string) {
    const assignmentId = await this.getActiveAssignmentIdForReporter(serviceId, userId);

    const room = await this.conversationService.getRoomBySource(NotificationSourceType.SERVICE_REQUEST, assignmentId);

    if (!room) {
      throw new NotFoundException('No conversation has been started for this case yet.');
    }

    return { chatRoomId: room.id };
  }

  async rejectService(serviceId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.rejectCase(serviceId, orgProfile.id);
  }

  async resolveService(serviceId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }
    return this.repo.resolveCase(serviceId, orgProfile.id);
  }

  async withdrawService(serviceId: string, userId: string) {
    const reporterProfile = await this.repo.findRequesterProfileByUserId(userId);
    if (!reporterProfile) {
      throw new ForbiddenException('No reporter profile found for this account.');
    }
    return this.repo.withdrawCase(serviceId, reporterProfile.id);
  }

  async getContactContext(serviceId: string, userId: string) {
    const orgProfile = await this.repo.getSupportOrgProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenException('No organization profile found for this account.');
    }

    const context = await this.repo.getContactContext(serviceId, orgProfile.id);
    if (!context) {
      throw new NotFoundException('Case or assignment not found.');
    }

    return context; // { assignment: { id, status }, reporterUserId, organizationUserId }
  }

  async getActiveAssignmentIdForReporter(serviceId: string, userId: string) {
    const reporterProfile = await this.repo.findRequesterProfileByUserId(userId);
    if (!reporterProfile) {
      throw new ForbiddenException('No reporter profile found for this account.');
    }

    const assignmentId = await this.repo.getActiveAssignmentId(serviceId, reporterProfile.id);
    if (!assignmentId) {
      throw new NotFoundException('No active conversation for this case yet.');
    }

    return assignmentId;
  }

  // Update a service request
  async updateServiceRequest(id: string, userId: string, dto: UpdateServiceDto) {
    // Map the DTO to Prisma's update input format
    const data: Prisma.ServiceRequestsUpdateInput = {
      // Top level fields
      whoNeedsThisService: dto.whoNeedsThisService,
      ageRange: dto.ageRange,
      phone: dto.phone,
      email: dto.email,
      infoConfirmed: dto.infoConfirmed,

      // Nested serviceDetails update
      ...(dto.serviceDetails && {
        serviceDetails: {
          update: {
            serviceType: { connect: { id: dto.serviceDetails.serviceTypeId } },
            vulnerabilityStatus: {
              connect: { id: dto.serviceDetails.vulnerabilityStatusId },
            },
            maritalStatus: dto.serviceDetails.maritalStatus,
            workStatus: dto.serviceDetails.workStatus,
            description: dto.serviceDetails.description,
          },
        },
      }),
    };
    return this.safeExecutor.run(
      () => this.repo.updateServiceRequest(id, userId, data),
      `Failed to update service request id: ${id}`,
    );
  }

  // soft delete a service request
  async deleteServiceRequest(id: string, userId: string) {
    const [serviceRequest, reporter] = await Promise.all([
      this.repo.getServiceRequestById(id),
      this.repo.findRequesterProfileByUserId(userId),
    ]);

    // Check if both exists
    if (!serviceRequest?.id || !reporter?.id) return null;

    // Check ownership ( should be a reporter )
    if (serviceRequest?.requesterReporterProfile?.id !== reporter?.id)
      throw new ForbiddenException(`Not allowed to deleted this request`);
    return this.safeExecutor.run(
      () => this.repo.softDeleteServiceRequest(id, userId),
      `Failed to delete service request id: ${id}`,
    );
  }
}

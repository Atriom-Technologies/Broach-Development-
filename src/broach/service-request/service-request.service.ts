import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SafeExecutor } from 'src/utils/safe-execute';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { Prisma, UserType } from '@prisma/client';
import { ServiceRepository } from './service-repository/service.repository';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AppLogger } from 'src/logger/logger.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE, SERVICE_REQUEST_JOB } from 'src/shared/constant/case.constants';
import { ServiceRequestListItem } from './types';
import { CursorPaginationDto } from './dto/pagination.dto';
@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly serviceRequestQueue: Queue,

    private readonly safeExecutor: SafeExecutor,
    private readonly repo: ServiceRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ServiceRequestService.name);
  }

  // Create a new service request
  async createServiceRequest(dto: BioDetailsDto, userId: string) {
    const user = await this.repo.findUserById(userId); // assumes this includes requesterReporterProfile, like createCase does

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
      requesterReporterProfile: { connect: { id: user.requesterReporterProfile.userId } },
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

    const serviceRequest = await this.repo.createServiceRequest({
      data,
      include: { requesterReporterProfile: { include: { user: true } }, serviceDetails: true },
    });

    try {
      await this.serviceRequestQueue.add(
        SERVICE_REQUEST_JOB, // use a constant, same lesson as the case-report job name mismatch
        { requestId: serviceRequest.id, requesterReporterProfileId: user.requesterReporterProfile.userId },
        { attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
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

  // Fetch all service requests
  async getAllServiceRequests(pagination: CursorPaginationDto) {
    const { cursor, limit } = pagination;

    const requests = await this.repo.getAllServiceRequests(limit, cursor);

    if (!requests.length) throw new NotFoundException('No Data Available.');

    const hasNextPage = requests.length > limit;
    const items = hasNextPage ? requests.slice(0, limit) : requests;

    return {
      data: items.map((item) => this.toServiceRequestSummary(item)),
      meta: {
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].id : null,
      },
    };
  }

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

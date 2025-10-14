import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SafeExecutor } from 'src/utils/safe-execute';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { Prisma, UserType } from '@prisma/client';
import { ServiceRepository } from './service-repository/service.repository';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
@Injectable()
export class ServiceRequestService {
  constructor(
    private readonly safeExecutor: SafeExecutor,
    private readonly repo: ServiceRepository,
  ) {}

  // Create a new service request
  async createServiceRequest(dto: BioDetailsDto, userId: string) {
    // Check if usertype is requester/reporter before allowing access

    const user = await this.safeExecutor.run(
      () => this.repo.findUserTypeById(userId),
      'No user type found for service request',
    );

    if (user?.userType !== UserType.requester_reporter)
      throw new ForbiddenException('Not authorized to request a service');

    // Check if the requesterProfileId exists
    const profile = await this.safeExecutor.run(
      () => this.repo.findRequesterProfileByUserId(userId),
      'Sorry profile not found',
    );

    // If profile not found, return an error message
    if (!profile)
      throw new BadRequestException(
        'Please complete your profile before requesting for a service',
      );

    // Check if ServiceType ID from front end is valid. ServiceTYpe would be selected and just the id would be sent from front end
    // const serviceTypeId = await this.safeExecutor.run(
    //     () => this.prisma.serviceType.findUnique(
    //         { where: { id: dto.serviceDetails.serviceTypeId }}
    //     ),`Failed to fetch Request Service Id: ${dto.serviceDetails.serviceTypeId}`
    // );
    // if(!serviceTypeId) throw new BadRequestException(`Invalid service type. Please select a valid type of service`)

    // Check if vulnerable status ID from front end is valid. vulnerable status would be selected and just the id would be sent
    // const vulnerabilityStatusId = await this.safeExecutor.run(
    //     () => this.prisma.serviceRequests.findUnique({
    //         where: {
    //             id: dto.serviceDetails.vulnerabilityStatusId
    //         }
    //     }),`Failed to fetch Case Id: ${dto.serviceDetails.vulnerabilityStatusId}`
    // );
    // if(!vulnerabilityStatusId) throw new BadRequestException(`Invalid type. Please select a valid vulenerability status`)

    // Build the data to be created

    const data: Prisma.ServiceRequestsCreateInput = {
      requesterReporterProfile: { connect: { id: profile.id } },
      whoNeedsThisService: dto.whoNeedsThisService,
      ageRange: dto.ageRange,
      phone: dto.phone,
      email: dto.email,
      infoConfirmed: dto.infoConfirmed,

      ...(dto.serviceDetails && {
        serviceDetails: {
          create: {
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

    // Create the service request
    await this.safeExecutor.run(
      () => this.repo.createServiceRequest(data),
      'Failed to create a service request',
    );
  }

  // Fetch a service request by ID
  async getServiceRequest(id: string) {
    return this.safeExecutor.run(
      () => this.repo.getServiceRequestById(id),
      `Failed to fetch service request id: ${id}`,
    );
  }

  // Fetch all service requests
  async getAllServiceRequests(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;

    return this.safeExecutor.run(
      () => this.repo.getAllServiceRequests(skip, pagination.limit),
      `Failed to get all cases`,
    );
  }

  // Update a service request
  async updateServiceRequest(
    id: string,
    userId: string,
    dto: UpdateServiceDto,
  ) {
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

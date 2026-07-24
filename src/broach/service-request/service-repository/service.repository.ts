import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { REDIS_CACHE_CLIENT } from 'src/common/redis/redis-cache.module';
import { LookupService } from 'src/lookup/lookup.service';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import Redis from 'ioredis';
import { ExtendedPrismaClient, PrismaService } from 'src/prisma/prisma.service';
import { AppLogger } from 'src/logger/logger.service';

@Injectable()
export class ServiceRepository {
  constructor(
    // private readonly prisma: PrismaService,
    private readonly lookupService: LookupService,
    @Inject(PRISMA_CLIENT) private readonly prisma: ExtendedPrismaClient,
    @Inject(REDIS_CACHE_CLIENT) private readonly redis: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ServiceRepository.name);
  }

  // Find user by ID and return userType
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        userType: true,
        requesterReporterProfile: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  // Find requester profile by user ID
  async findRequesterProfileByUserId(userId: string) {
    return this.prisma.requesterReporterProfile.findUnique({
      where: { userId },
    });
  }

  // Find service type by ID
  async findServiceTypeById(id: string) {
    return this.prisma.serviceType.findUnique({
      where: { id },
    });
  }

  // Find vulnerability status by ID
  async findVulnerabilityStatusById(id: string) {
    return this.prisma.vulnerabilityStatus.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }

  async getSupportOrgProfileByUserId(userId: string) {
    return this.prisma.supportOrgProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  // Create a new service request
  async createServiceRequest(args: Prisma.ServiceRequestsCreateArgs, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    return prisma.serviceRequests.create(args);
  }

  // service-request.repository.ts

  async getServiceRequestById(id: string) {
    const cacheKey = `service:details:${id}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (redisError) {
      if (redisError instanceof Error) {
        this.logger.error(`[ServiceRequestRepository] Redis connection failed on key ${cacheKey}`, redisError.stack);
      } else {
        this.logger.error(
          `[ServiceRequestRepository] An unknown error occurred on key ${cacheKey}`,
          String(redisError),
        );
      }
    }

    const serviceRequest = await this.prisma.serviceRequests.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        createdAt: true,
        requestStatus: true,
        claimedByOrganizationId: true,
        serviceDetails: {
          select: {
            id: true,
            description: true,
            serviceType: { select: { id: true, name: true } },
          },
        },
        requesterReporterProfile: {
          select: { id: true, fullName: true, profilePicture: true },
        },
      },
    });

    if (serviceRequest) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(serviceRequest), 'EX', 3600);
      } catch (redisError) {
        // cache write failure shouldn't break the request — just log and move on
        this.logger.error(`[ServiceRequestRepository] Redis write failed on key ${cacheKey}`, String(redisError));
      }
    }

    return serviceRequest;
  }
  // // Get service request by ID
  // async getServiceRequestById(id: string) {
  //   return this.prisma.serviceRequests.findFirst({
  //     where: {
  //       id,
  //       deletedAt: null,
  //     },
  //     select: {
  //       id: true,
  //       createdAt: true,
  //       serviceDetails: {
  //         select: {
  //           id: true,
  //           description: true,
  //           serviceType: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //       },
  //       requesterReporterProfile: {
  //         select: {
  //           id: true,
  //           fullName: true,
  //         },
  //       },
  //     },
  //   });
  // }

  async getServiceRequestByIdForReporter(requestId: string, requesterReporterProfileId: string) {
    return this.prisma.serviceRequests.findFirst({
      where: {
        id: requestId,
        requesterReporterProfileId,
        deletedAt: null,
      },
      select: {
        id: true,
        requestStatus: true,
        serviceDetails: {
          select: { description: true, serviceType: { select: { name: true } } },
        },
      },
    });
  }

  async getAllServiceRequests(take: number, cursor?: string) {
    return this.prisma.serviceRequests.findMany({
      take: take + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        createdAt: true,
        requesterReporterProfile: {
          select: { profilePicture: true, fullName: true },
        },
        serviceDetails: {
          select: {
            description: true,
            serviceType: { select: { name: true } },
          },
        },
        claimedByOrganization: {
          select: {
            id: true,
            organizationName: true,
            organizationLogoUrl: true,
          },
        },
      },
    });
  }

  async claimService(serviceId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Atomic: only succeeds if caseStatus is STILL 'pending' at the moment of the write.
      const result = await tx.serviceRequests.updateMany({
        where: {
          id: serviceId,
          OR: [
            { requestStatus: 'pending' },
            { claimedByOrganizationId: organizationId }, // same org re-triggering "Resume" — harmless no-op
          ],
        },
        data: { requestStatus: 'in_discussion', claimedByOrganizationId: organizationId },
      });
      // count === 0 means someone else claimed it in the gap between your GET and this call
      if (result.count === 0) {
        throw new ConflictException('This case has already been claimed by another organization.');
      }

      // Upsert since the org may have a prior 'rejected' assignment row from a past loop
      await tx.serviceAssignment.upsert({
        where: { serviceId_organizationId: { serviceId, organizationId } },
        create: { serviceId, organizationId, status: 'in_discussion' },
        update: { status: 'in_discussion' },
      });

      return { success: true, serviceId, requestStatus: 'in_discussion' as const };
    });
  }

  async rejectCase(serviceId: string, organizationId: string) {
    await this.prisma.$transaction(async (tx) => {
      const result = await tx.serviceRequests.updateMany({
        where: { id: serviceId, claimedByOrganizationId: organizationId }, // only the current claimant may reject
        data: { requestStatus: 'pending', claimedByOrganizationId: null },
      });

      if (result.count === 0) {
        throw new ForbiddenException('You do not currently hold this case, or it has already moved on.');
      }

      await tx.serviceAssignment.update({
        where: { serviceId_organizationId: { serviceId, organizationId } },
        data: { status: 'rejected' },
      });

      return { success: true, serviceId, serviceStatus: 'pending' as const };
    });
  }

  async resolveCase(serviceId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.serviceRequests.updateMany({
        where: { id: serviceId, claimedByOrganizationId: organizationId },
        data: { requestStatus: 'resolved' },
      });

      if (result.count === 0) {
        throw new ForbiddenException('You do not currently hold this case, or it has already moved on.');
      }

      await tx.serviceAssignment.update({
        where: { serviceId_organizationId: { serviceId, organizationId } },
        data: { status: 'resolved' },
      });

      return { success: true, serviceId, serviceStatus: 'resolved' as const };
    });
  }

  async withdrawCase(serviceId: string, requesterReporterProfileId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.serviceRequests.updateMany({
        where: {
          id: serviceId,
          requesterReporterProfileId, // only the case's own reporter may withdraw
          requestStatus: { in: ['pending', 'in_discussion'] },
        },
        data: { requestStatus: 'withdrawn', claimedByOrganizationId: null },
      });

      if (result.count === 0) {
        throw new ForbiddenException(
          'This case cannot be withdrawn — it may already be resolved, or you are not its owner.',
        );
      }

      // If an org currently held the claim, mark their assignment row too —
      // otherwise their row still says 'in_discussion' forever, which is wrong.
      await tx.serviceAssignment.updateMany({
        where: { serviceId, status: 'in_discussion' },
        data: { status: 'withdrawn' }, // or a distinct 'withdrawn' value if you want to track it separately on assignments
      });

      return { success: true, serviceId, caseStatus: 'withdrawn' as const };
    });
  }

  async getContactContext(serviceId: string, organizationId: string) {
    const [assignment, serviceRequest] = await Promise.all([
      this.prisma.serviceAssignment.findUnique({
        where: { serviceId_organizationId: { serviceId, organizationId } },
        select: { id: true, status: true },
      }),
      this.prisma.serviceRequests.findUnique({
        where: { id: serviceId },
        select: {
          requesterReporterProfile: { select: { userId: true } },
        },
      }),
    ]);

    if (!assignment || !serviceRequest?.requesterReporterProfile) return null;

    const orgUser = await this.prisma.supportOrgProfile.findUnique({
      where: { id: organizationId },
      select: { userId: true },
    });
    if (!orgUser) return null;

    return {
      assignment,
      reporterUserId: serviceRequest.requesterReporterProfile.userId,
      organizationUserId: orgUser.userId,
    };
  }

  async getActiveAssignmentId(serviceId: string, requesterReporterProfileId: string) {
    const serviceRequest = await this.prisma.serviceRequests.findFirst({
      where: { id: serviceId, requesterReporterProfileId },
      select: { claimedByOrganizationId: true },
    });

    if (!serviceRequest?.claimedByOrganizationId) return null;

    const assignment = await this.prisma.serviceAssignment.findUnique({
      where: {
        serviceId_organizationId: {
          serviceId,
          organizationId: serviceRequest.claimedByOrganizationId,
        },
      },
      select: { id: true },
    });

    return assignment?.id ?? null;
  }

  async getAssignmentForOrg(serviceId: string, organizationId: string) {
    return this.prisma.serviceAssignment.findUnique({
      where: {
        serviceId_organizationId: { serviceId, organizationId },
      },
      select: {
        status: true,
      },
    });
  }

  // Update a service request
  async updateServiceRequest(id: string, userId: string, data: Prisma.ServiceRequestsUpdateInput) {
    return this.prisma.serviceRequests.update({
      where: {
        id,
        requesterReporterProfile: {
          userId,
        },
      },
      data,
      include: { serviceDetails: true },
    });
  }

  // soft delete a service request
  async softDeleteServiceRequest(id: string, userId: string) {
    return this.prisma.serviceRequests.update({
      where: {
        id,
        deletedAt: null,
        requesterReporterProfile: {
          userId,
        },
      },
      data: { deletedAt: new Date() },
    });
  }
}

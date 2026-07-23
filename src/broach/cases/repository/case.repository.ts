import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ExtendedPrismaClient } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LookupService } from 'src/lookup/lookup.service';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import Redis from 'ioredis';
import { REDIS_CACHE_CLIENT } from 'src/common/redis/redis-cache.module';
import { AppLogger } from 'src/logger/logger.service';

@Injectable()
export class CaseRepository {
  constructor(
    private readonly lookupService: LookupService,
    @Inject(PRISMA_CLIENT) private readonly prisma: ExtendedPrismaClient,
    @Inject(REDIS_CACHE_CLIENT) private readonly redis: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(CaseRepository.name);
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        userType: true,
        requesterReporterProfile: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async getRequesterReporterProfileByUserId(userId: string) {
    return this.prisma.requesterReporterProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async getSupportOrgProfileByUserId(userId: string) {
    return this.prisma.supportOrgProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async findCaseTypeById(id: string) {
    // Hits redis memory for a lookup
    return this.lookupService.findById('caseType', id);
  }

  async findVulnerabilityStatusById(id: string) {
    return this.lookupService.findById('vulnerabilityStatus', id);
  }

  // Case Details CRUD operations
  async createCase(args: Prisma.CaseDetailsCreateArgs, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    return prisma.caseDetails.create(args);
  }

  async getCaseById(id: string) {
    const cacheKey = `case:details:${id}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (redisError) {
      if (redisError instanceof Error) {
        this.logger.error(`[CaseRepository] Redis connection failed on key ${cacheKey}`, redisError.stack);
      } else {
        // Fallback case just in case something bizarre was thrown
        this.logger.error(`[CaseRepository] An unknown error occurred on key ${cacheKey}`, String(redisError));
      }
    }

    // On cache miss
    const caseDetals = await this.prisma.caseDetails.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        description: true,
        createdAt: true,
        caseStatus: true,
        claimedByOrganizationId: true,
        caseType: {
          select: { id: true, name: true },
        },
        requesterReporterProfile: {
          select: { id: true, fullName: true, profilePicture: true },
        },
      },
    });

    // Save the complete joined object to Redis
    if (caseDetals) await this.redis.set(cacheKey, JSON.stringify(caseDetals), 'EX', 3600);

    return caseDetals;
  }
  async getCaseByIdForReporter(caseId: string, requesterReporterProfileId: string) {
    return this.prisma.caseDetails.findFirst({
      where: {
        id: caseId,
        requesterReporterProfileId, // scoped — a reporter can only fetch their own case
        deletedAt: null,
      },
      select: {
        id: true,
        description: true,
        caseStatus: true,
      },
    });
  }
  async getAllCases(take: number, cursor?: string) {
    return this.prisma.caseDetails.findMany({
      take: take + 1, // fetch one extra to know if there's a next page
      ...(cursor && {
        skip: 1, // skip the cursor item itself
        cursor: { id: cursor },
      }),
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // compound order keeps cursor seeking stable
      select: {
        id: true,
        description: true,
        createdAt: true,
        requesterReporterProfile: {
          select: {
            id: true,
            profilePicture: true,
            fullName: true,
          },
        },
        claimedByOrganization: {
          select: {
            id: true,
            organizationName: true,
            organizationLogoUrl: true,
          },
        },
        caseType: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async claimCase(caseId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Atomic: only succeeds if caseStatus is STILL 'pending' at the moment of the write.
      const result = await tx.caseDetails.updateMany({
        where: { id: caseId, caseStatus: 'pending' },
        data: { caseStatus: 'in_discussion', claimedByOrganizationId: organizationId },
      });

      // count === 0 means someone else claimed it in the gap between your GET and this call
      if (result.count === 0) {
        throw new ConflictException('This case has already been claimed by another organization.');
      }

      // Upsert since the org may have a prior 'rejected' assignment row from a past loop
      await tx.caseAssignment.upsert({
        where: { caseId_organizationId: { caseId, organizationId } },
        create: { caseId, organizationId, status: 'in_discussion' },
        update: { status: 'in_discussion' },
      });

      return { success: true, caseId, caseStatus: 'in_discussion' as const };
    });
  }

  async rejectCase(caseId: string, organizationId: string) {
    await this.prisma.$transaction(async (tx) => {
      const result = await tx.caseDetails.updateMany({
        where: { id: caseId, claimedByOrganizationId: organizationId }, // only the current claimant may reject
        data: { caseStatus: 'pending', claimedByOrganizationId: null },
      });

      if (result.count === 0) {
        throw new ForbiddenException('You do not currently hold this case, or it has already moved on.');
      }

      await tx.caseAssignment.update({
        where: { caseId_organizationId: { caseId, organizationId } },
        data: { status: 'rejected' },
      });

      return { success: true, caseId, caseStatus: 'pending' as const };
    });
  }

  async resolveCase(caseId: string, organizationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.caseDetails.updateMany({
        where: { id: caseId, claimedByOrganizationId: organizationId },
        data: { caseStatus: 'resolved' },
      });

      if (result.count === 0) {
        throw new ForbiddenException('You do not currently hold this case, or it has already moved on.');
      }

      await tx.caseAssignment.update({
        where: { caseId_organizationId: { caseId, organizationId } },
        data: { status: 'resolved' },
      });

      return { success: true, caseId, caseStatus: 'resolved' as const };
    });
  }

  async withdrawCase(caseId: string, requesterReporterProfileId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.caseDetails.updateMany({
        where: {
          id: caseId,
          requesterReporterProfileId, // only the case's own reporter may withdraw
          caseStatus: { in: ['pending', 'in_discussion'] },
        },
        data: { caseStatus: 'withdrawn', claimedByOrganizationId: null },
      });

      if (result.count === 0) {
        throw new ForbiddenException(
          'This case cannot be withdrawn — it may already be resolved, or you are not its owner.',
        );
      }

      // If an org currently held the claim, mark their assignment row too —
      // otherwise their row still says 'in_discussion' forever, which is wrong.
      await tx.caseAssignment.updateMany({
        where: { caseId, status: 'in_discussion' },
        data: { status: 'withdrawn' }, // or a distinct 'withdrawn' value if you want to track it separately on assignments
      });

      return { success: true, caseId, caseStatus: 'withdrawn' as const };
    });
  }

  async getContactContext(caseId: string, organizationId: string) {
    const [assignment, caseDetails] = await Promise.all([
      this.prisma.caseAssignment.findUnique({
        where: { caseId_organizationId: { caseId, organizationId } },
        select: { id: true, status: true },
      }),
      this.prisma.caseDetails.findUnique({
        where: { id: caseId },
        select: {
          requesterReporterProfile: { select: { userId: true } },
        },
      }),
    ]);

    if (!assignment || !caseDetails?.requesterReporterProfile) return null;

    const orgUser = await this.prisma.supportOrgProfile.findUnique({
      where: { id: organizationId },
      select: { userId: true },
    });
    if (!orgUser) return null;

    return {
      assignment,
      reporterUserId: caseDetails.requesterReporterProfile.userId,
      organizationUserId: orgUser.userId,
    };
  }

  async getActiveAssignmentId(caseId: string, requesterReporterProfileId: string) {
    const caseDetails = await this.prisma.caseDetails.findFirst({
      where: { id: caseId, requesterReporterProfileId },
      select: { claimedByOrganizationId: true },
    });

    if (!caseDetails?.claimedByOrganizationId) return null;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: {
        caseId_organizationId: {
          caseId,
          organizationId: caseDetails.claimedByOrganizationId,
        },
      },
      select: { id: true },
    });

    return assignment?.id ?? null;
  }

  async getAssignmentForOrg(caseId: string, organizationId: string) {
    return this.prisma.caseAssignment.findUnique({
      where: {
        caseId_organizationId: { caseId, organizationId },
      },
      select: {
        status: true,
      },
    });
  }

  /* 
   * Maps the UpdateCaseDto to Prisma's CaseDetailsUpdateInput format.
   * Handles nested objects (victimDetails, assailantDetails)
   * Only fields present in the DTO are included — supporting partial updates.

    private mapDtoToPrismaUpdate(dto: UpdateCaseDto): Prisma.CaseDetailsUpdateInput {
        const { victimDetails, assailantDetails, ...caseDetails } = dto;

        // Copy the top level fields from dto to data. others are handled separately cause they are nested objects
        const data: Prisma.CaseDetailsUpdateInput = { ...caseDetails };

        // Handle nested victimDetails update if provided
        if(victimDetails) data.victimDetails = { update: { ...victimDetails }};
        // Handle nested assailantDetails update also if provided
        if(assailantDetails) data.assailantDetails = { update: { ...assailantDetails }};
        return data;
    }

   * Updates a CaseDetails record with the given ID.
   * Supports partial updates(Just few fields and not neccessarily all fields) and nested updates for victimDetails and assailantDetails.
   * Includes nested objects in the returned result.
 */
  async updateCase(id: string, userId: string, data: Prisma.CaseDetailsUpdateInput) {
    return this.prisma.caseDetails.update({
      where: {
        id,
        deletedAt: null,
        requesterReporterProfile: {
          userId,
        },
      },
      data,
      include: {
        victimDetails: true,
        assailantDetails: true,
      },
    });
  }

  async softDeleteCase(id: string, userId: string) {
    const existing = await this.prisma.caseDetails.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) return null;
    return this.prisma.caseDetails.update({
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

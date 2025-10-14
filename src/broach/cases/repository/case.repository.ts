import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
      // select: { userType: true }
    });
  }

  async findRequesterProfileByUserId(userId: string) {
    return this.prisma.requesterReporterProfile.findUnique({
      where: { userId },
    });
  }

  async findCaseTypeById(id: string) {
    return this.prisma.caseType.findUnique({
      where: { id },
    });
  }

  async findVulnerabilityStatusById(id: string) {
    return this.prisma.vulnerabilityStatus.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }

  // Case Details CRUD operations
  async createCase(data: Prisma.CaseDetailsCreateInput) {
    return this.prisma.caseDetails.create({
      data,
      include: {
        victimDetails: true,
        assailantDetails: true,
      },
    });
  }

  async getCaseById(id: string) {
    return this.prisma.caseDetails.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        description: true,
        createdAt: true,
        caseType: {
          select: {
            id: true,
            name: true,
          },
        },
        requesterReporterProfile: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // cases.repository.ts
  async getAllCases(skip: number, take: number) {
    const [cases, total] = await Promise.all([
      this.prisma.caseDetails.findMany({
        skip,
        take,
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
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
          caseType: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.caseDetails.count({
        where: { deletedAt: null },
      }),
    ]);
    return { cases, total };
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
  async updateCase(
    id: string,
    userId: string,
    data: Prisma.CaseDetailsUpdateInput,
  ) {
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

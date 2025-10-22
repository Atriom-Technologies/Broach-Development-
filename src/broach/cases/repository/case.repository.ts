import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AssignmentStatus } from '@prisma/client';

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

/**
 * Fetch all sectors that are mapped to a given Case Type.
 *
 * Each Case Type (e.g., sexual_assault, child_abuse) can belong to one or more
 * sectors defined in the CaseTypeSector junction table.
 *
 * @param caseTypeId - The unique ID of the case type.
 * @returns Array of objects containing sectorId values.
 */
/* async findSectorsByCaseTypeId(caseTypeId: string) {
  return this.prisma.caseTypeSector.findMany({
    where: { caseTypeId },
    select: { sectorId: true }, // only fetch the sectorId (no need for full object)
  });
}
 */
/**
 * Find all support organizations that operate in any of the given sectors.
 * This query uses the SupportOrgSector junction table, which links organizations
 * to one or more sectors they operate in (selected during registration).
 *
 * @param sectorIds - Array of sector IDs to match against.
 * @returns Array of objects containing organizationId values.
 */
/* async findOrganizationsBySectorIds(sectorIds: string[]) {
  return this.prisma.supportOrgSector.findMany({
    where: { sectorId: { in: sectorIds } },
    select: { organizationId: true }, // only return organizationId to reduce payload
  });
} */

/**
 * Create pending case assignments for multiple organizations.
 * This method bulk-inserts one CaseAssignment per organization, linking
 * a case to all eligible organizations that match its sectors.
 * Uses createMany with skipDuplicates:
 * - Faster than multiple .create() calls.
 * - Avoids duplicate (caseId, organizationId) combinations due to the unique constraint.
 *
 * @param caseId - The ID of the newly created case.
 * @param organizationIds - Array of organization IDs to assign the case to.
 */
/* async createCaseAssignments(
  caseId: string, 
  organizationIds: string[],
tx: Prisma.TransactionClient = this.prisma ) {
  // If there are no matching organizations, skip the operation entirely.
  if (!organizationIds.length) return;

  // Prepare assignment objects
  const assignments = organizationIds.map((orgId) => ({
    caseId,
    organizationId: orgId,
    status: AssignmentStatus.pending, // initial state
  }));

  // Bulk insert all assignments; duplicates are ignored gracefully
  return tx.caseAssignment.createMany({
    data: assignments,
    skipDuplicates: true,
  });
} */

}

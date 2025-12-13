import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UserType,
  Gender,
  OrgSize,
  WhoIsReporting,
  Location,
  CaseStatus,
  AgeRange,
  EmploymentStatus,
  NoOfAssailants,
  MaritalStatus,
} from '@prisma/client';
import { parseEnum, toReadableLabel } from 'src/utils/formatString';

@Injectable()
export class MetaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all application enums as a plain object of arrays.
   * Each enum is converted into an array of its values for easy consumption
   * by the frontend (e.g., for dropdowns, selects, or validation).
   */
  async getEnums() {
    // Define thee enums to be included
    // Key is the name we want to expose while the value is the enum itself
    const enums = {
      userType: UserType,
      gender: Gender,
      organizationSize: OrgSize,
      whoIsReporting: WhoIsReporting,
      location: Location,
      caseStatus: CaseStatus,
      ageRange: AgeRange,
      employmentStatus: EmploymentStatus,
      noOfAssailants: NoOfAssailants,
      maritalStatus: MaritalStatus,
    };
    /**
     * Convert each enum into an array of its value i.e each enum has it own values,
     * Object.entries() gives us a key-value pair
     * We reduce it in to a new object using the the reduce keyword where each key maps to the enumm values
     */
    const formatted: Record<string, { value: string; label: string }[]> = {};

    for (const [key, enumObj] of Object.entries(enums)) {
      formatted[key] = Object.Values(enumObj).map(v=>toReadableLabel(v));
    }

    return formatted;
  }

  // This is for look up tables where enums have been convertedd to tables
  async getLookupTables() {
    const format = (rows: { id: string; name: string }[]) =>
      rows.map((row) => ({
        id: row.id,
        name: toReadableLabel(row.name),
      }));
    const [sectors, caseTypes, serviceTypes, vulnerabilityStatuses] =
      await Promise.all([
        this.prisma.sector.findMany({ select: { id: true, name: true } }),
        this.prisma.caseType.findMany({ select: { id: true, name: true } }),
        this.prisma.serviceType.findMany({ select: { id: true, name: true } }),
        this.prisma.vulnerabilityStatus.findMany({
          select: { id: true, name: true },
        }),
      ]);

    return {
      sectors: format(sectors),
      caseTypes: format(caseTypes),
      serviceTypes: format(serviceTypes),
      vulnerabilityStatuses: format(vulnerabilityStatuses),
    };
  }
}

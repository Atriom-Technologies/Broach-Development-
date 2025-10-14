import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all case types
  async getAllCaseTypes() {
    return this.prisma.caseType.findMany();
  }

  // Get all vulnerability statuses
  async getAllVulnerabilityStatuses() {
    return this.prisma.vulnerabilityStatus.findMany({
      select: { id: true, name: true },
    });
  }

  // Get all service types
  async getAllServiceTypes() {
    return this.prisma.serviceType.findMany();
  }

  // Get all sectors
  async getAllSectors() {
    return this.prisma.sector.findMany({
      select: { id: true, name: true },
    });
  }
}

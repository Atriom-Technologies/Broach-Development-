import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Find user by ID and return userType
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        userType: true,
        requesterReporterProfile: {
          select: {
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

  // Create a new service request
  async createServiceRequest(args: Prisma.ServiceRequestsCreateArgs, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    return prisma.serviceRequests.create(args);
  }

  // Get service request by ID
  async getServiceRequestById(id: string) {
    return this.prisma.serviceRequests.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        serviceDetails: {
          select: {
            id: true,
            description: true,
            serviceType: {
              select: {
                id: true,
                name: true,
              },
            },
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

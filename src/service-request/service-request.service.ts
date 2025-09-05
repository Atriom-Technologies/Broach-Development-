import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { ApiResponse } from 'src/common/dto/api-response.dto';
@Injectable()
export class ServiceRequestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly safeExecutor: SafeExecutor
    ) { }

    // Create a new service request
    async createServiceRequest(dto: BioDetailsDto, userId: string): Promise<ApiResponse> {
        // Check if the requesterProfileId exists
        const profile = await this.safeExecutor.run(
            () => this.prisma.requesterReporterProfile.findUnique({ 
                where: { userId }
            }),
            'Sorry profile not found'
        );

        // If profile not found, return an error message
        if (!profile) {
            return {
                success: false,
                message: {
                 title: "Profile Not Found",
                 body: "We could not find your profile. Please create one before making a service request.",
                }
            };
        }

        // Create the service request
        const alert = "Service Request Sent"
        const result = await this.safeExecutor.run(
            () => this.prisma.bioDetails.create({
                data: {
                    requesterReporterProfileId: profile.id,
                    whoNeedsThisService: dto.whoNeedsThisService,
                    ageRange: dto.ageRange,
                    phone: dto.phone,
                    email: dto.email,
                    serviceDetails: dto.serviceDetails ?
                    { create: dto.serviceDetails }: undefined,
                    infoConfirmed: dto.infoConfirmed,
                },
                include: {
                    serviceDetails: true,
                },
            }),
            'Failed to create a service request'
        );
        return {
            success: true,
            message: {
                title: alert,
                body: "Your request has been sent and you will be getting a response soon. Please keep checking your messages, you will be adequately notified when response is ready.",
            }
        }
    }
}

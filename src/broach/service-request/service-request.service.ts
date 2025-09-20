import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { Prisma, UserType } from '@prisma/client';
import { connect } from 'http2';
@Injectable()
export class ServiceRequestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly safeExecutor: SafeExecutor
    ) { }

    // Create a new service request
    async createServiceRequest(dto: BioDetailsDto, userId: string): Promise<ApiResponse> {


        // Check if usertype is requester/reporter before allowing access
        
        const user = await this.safeExecutor.run(

            () => this.prisma.user.findUnique({
                where: { id: userId },
                select: { userType: true }
            }),
            'No user type found for service request'
        )

        if (user?.userType !== UserType.requester_reporter) throw new ForbiddenException('Not authorized to request a service');

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
                 body: "We could not find your profile. Please create one before making a request.",
                }
            };
        }


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
            requesterReporterProfile: { connect: { id: profile.id }},
            whoNeedsThisService: dto.whoNeedsThisService,
            ageRange: dto.ageRange,
            phone: dto.phone,
            email: dto.email,
            infoConfirmed: dto.infoConfirmed,
            
            ...(dto.serviceDetails && {
                serviceDetails: {
                    create: {
                        serviceType: {connect: {id: dto.serviceDetails.serviceTypeId}},
                        vulnerabilityStatus: { connect: {id: dto.serviceDetails.vulnerabilityStatusId}},
                        maritalStatus: dto.serviceDetails.maritalStatus,
                        workStatus: dto.serviceDetails.workStatus,
                        description: dto.serviceDetails.description,
                    }
                }
            })

        }

        // Create the service request
        const alert = "Service Request Sent"
        const result = await this.safeExecutor.run(
            () => this.prisma.serviceRequests.create({
                data,
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

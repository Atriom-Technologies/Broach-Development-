import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { UserType } from '@prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { Prisma } from '@prisma/client';


@Injectable()
export class CasesService {
    constructor(private readonly prisma: PrismaService, 
        private readonly safeExecutor: SafeExecutor
    ) { }

    // Submit a case
    async createCase(dto: CreateCaseDto, userId: string): Promise<ApiResponse> {

        // Check if usertype is requester/reporter before allowing access


        const user = await this.safeExecutor.run(

            () => this.prisma.user.findUnique({
                where: { id: userId },
                select: { userType: true }
            }),
            'No user type found for case report'
        )

        if (user?.userType !== UserType.requester_reporter) {
            throw new ForbiddenException('Not authorized to Submit cases');
        }

        // Check if the requesterProfileId exists
        const profile = await this.safeExecutor.run( 
            () => this.prisma.requesterReporterProfile.findUnique({ where : { userId }}),
            
            `UserId ${userId} not found`);

        // If profile not found, return an error message
        if (!profile) {
                return {
                    success: false,
                    message: {
                        title: "Profile Not Found",
                        body: "We could not find your profile. Please create one.",
                    }
                };
            }


            
        // Check if case type ID from front end is valid. Case type would be selected and just the id would be sent 
            const caseType = await this.safeExecutor.run(
                () => this.prisma.caseType.findUnique(
                    { where: { id: dto.typeOfAssaultId }}
                ),`Failed to fetch Case Id: ${dto.typeOfAssaultId}`
            );
            if(!caseType) throw new BadRequestException(`Invalid case type. Please select a valid case type`)

            // Validate vulnerabilityStatus (only if victimDetails is provided)
            // Check if vulnerable status ID from front end is valid. vulnerable status would be selected and just the id would be sent 
        if(dto.victimDetails?.vulnerabilityStatusId){
            
            const vulnerabilityStatus = await this.safeExecutor.run(                
                () => this.prisma.vulnerabilityStatus.findUnique({
                    where: { 
                        id: dto.victimDetails?.vulnerabilityStatusId 
                    }
                }),`Failed to fetch Case Id: ${dto.typeOfAssaultId}`
            );
            if(!vulnerabilityStatus) throw new BadRequestException(`Invalid type. Please select a valid vulenerable status`)
                
        }            

            // Build the data to be created 
            const data: Prisma.CaseDetailsCreateInput = {
                requesterReporterProfile:{ connect: { id: profile.id }},
                caseType: { connect: { id: caseType.id }},
                whoIsReporting: dto.whoIsReporting,   
                location: dto.location,
                description: dto.description,
                infoConfirmed: dto.infoConfirmed,


                ...(dto.victimDetails && { 
                    victimDetails: { 
                        create: {
                            ageRange: dto.victimDetails.ageRange,
                            employmentStatus: dto.victimDetails.employmentStatus,
                            gender: dto.victimDetails.gender,
                            vulnerabilityStatusId: dto.victimDetails.vulnerabilityStatusId
                        }
                    }
                }),

                ...(dto.assailantDetails && {
                    assailantDetails: {
                        create: {
                            noOfAssailants: dto.assailantDetails.noOfPeople,
                            gender: dto.assailantDetails.gender,
                            ageRange: dto.assailantDetails.ageRange
                        }
                    }
                })
            }   

            // Create the case
            const alert = "Case Reported";
            await this.safeExecutor.run( 
                () => this.prisma.caseDetails.create({
                    data,
                    include: {
                        victimDetails: true,
                        assailantDetails: true
                    }
                }),'Failed to create a case'
            );
            
            return {
                success: true,
                message: {
                    title: alert,
                    body: 'Your case has been submitted successfully. It will be reviewed and reported to the relevant organizations as necessary. you will be notified of any updates regarding your case in your message tab. Check regularly for updates. Please remember that false reporting can have serious consequences, so ensure that the information you provide is accurate and truthful.'
                }
            }
    }
}
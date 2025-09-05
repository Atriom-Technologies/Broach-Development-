import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { SafeExecutor } from 'src/utils/safe-execute';
import { ApiResponse } from 'src/common/dto/api-response.dto';

@Injectable()
export class CasesService {
    constructor(private readonly prisma: PrismaService, 
        private readonly safeExecutor: SafeExecutor
    ) { }

    // Create a new case
    async createCase(dto: CreateCaseDto, userId: string): Promise<ApiResponse> {

        // Check if the requesterProfileId exists
        const profile = await this.safeExecutor.run( 
            () => this.prisma.requesterReporterProfile.findUnique({ where : { userId } }),
            
            'Sorry profile not found');

// If profile not found, return an error message
            if (!profile) {
                return {
                    success: false,
                    message: {
                        title: "Profile Not Found",
                        body: "We could not find your profile. Please create one before reporting a case.",
                    }
                };
            }

            // Create the case
            const alert = "Case Reported";
        const result = await this.safeExecutor.run( () => this.prisma.caseDetails.create({
                data: {
                    requesterReporterProfileId: profile.id,
                    whoIsReporting: dto.whoIsReporting,
                    typeOfCase: dto.typeOfCase,
                    location: dto.location,
                    description: dto.description,
                    infoConfirmed: dto.infoConfirmed,
                    victimDetails: dto.victimDetails? 
                    { create: dto.victimDetails }: undefined,
                    assailantDetails: dto.assailantDetails?
                    { create: dto.assailantDetails }: undefined,
                },
                // Return the created case along with victim and assailant details
                include: {
                    victimDetails: true,
                    assailantDetails: true,
                },
            }),'Failed to create a case');

            return {
                success: true,
                message: {
                    title: alert,
                    body: 'Your case has been submitted successfully. It will be reviewed and reported to the relevant organizations as necessary. you will be notified of any updates regarding your case in your message tab. Check regularly for updates. Please remember that false reporting can have serious consequences, so ensure that the information you provide is accurate and truthful.'
        
            }
    }
}
}
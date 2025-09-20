import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { Prisma } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { OrganizationProfileDto } from './dto/organization-profile.dto';

@Injectable()
export class OrganizationProfileService {
    constructor( 
        private readonly prisma: PrismaService,
        private readonly safeExecutor: SafeExecutor,
        private readonly logger: AppLogger,
        @Inject('CLOUDINARY') private readonly cloudinary: typeof import('cloudinary').v2,
    ){}

    async updateOrganizationProfile(dto: OrganizationProfileDto, userId: string, file?: Express.Multer.File){
        // Receive data from dto
        const {...dtos} = dto;

        // Fetch User by Id
        const user = await this.safeExecutor.run(
            () => this.prisma.user.findUnique({
                where: {id: userId}
            }),`Failed to fetch user id ${userId}`)

            // Check if user exists
            if(!user) {
                this.logger.warn(`No record for User: ${userId}`);
                throw new BadRequestException(`No record found`);
            };
            
                //  Handle profile picture
                let organizationLogoUrl = dto.organizationLogo; // fallback to plain URL

                if (file) {
                    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {

                        this.cloudinary.uploader.upload_stream(

                            {

                                folder: 'broach/profiles',
                                public_id: `${userId}-profile`,
                                overwrite: true,
                                resource_type: 'image'
                            },

                            (error: UploadApiErrorResponse, result: UploadApiResponse) => {

                                if (error) return reject(error);
                                    resolve(result);
                            },
                        ).end(file.buffer);
                    });

                        organizationLogoUrl = uploadResult.secure_url;
                }


                // const uniqueSectorIds = [...new Set(dto.sectors)];

                const existingSectors = await this.prisma.sector.findMany({
                    where: { id: { in: dto.sectors } },
                    });


            // Build data to update
            const data: Prisma.SupportOrgProfileUpdateInput = {
                user: { connect : { id: user?.id}},
                customSector: dto.customSector,
                dateEstablished: dto.dateEstablished? new Date(dto.dateEstablished): undefined,
                organizationSize: dto.organizationSize,
                address: dto.address,
                alternatePhone: dto.alternatePhone,
                ...(organizationLogoUrl ? { organizationLogo: organizationLogoUrl }: {}),
                sectors: {
                    //set: [], // optional: clears old ones if you're updating
                    connect: existingSectors.map((sector) => ({ id: sector.id })),
                }, 
            }
            //Update the requester profile data
            await this.safeExecutor.run(
                () => this.prisma.supportOrgProfile.update({
                where: { userId },
                data
            }),`Failed to update profile for user: ${data.id}`)  

            return {
                success: true,
                message: {
                    title: 'Profile updated'
                }
            }

    }
}

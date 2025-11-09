import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { Prisma, UserType } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { EditOrganizationProfileDto, OrganizationProfileDto } from './dto/organization-profile.dto';

@Injectable()
export class OrganizationProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safeExecutor: SafeExecutor,
    private readonly logger: AppLogger,
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof import('cloudinary').v2,
  ) {}

    // Get an organization Profile Details by user ID
  async getOrganizationProfileDetails(userId: string) {
    // Chect for user existence by id
    const user = await this.safeExecutor.run(
      () => this.prisma.user.findUnique({
        where: { id: userId }
      }), `Error trying to fetch User: ${userId}`);

      if(!user){
        this.logger.warn(`No record for this user: ${userId}`)
      }
      // Fetch the profile
    const profile = await this.prisma.user.findUnique({
        where: {id: userId},
        select: {
          email: true,
          phone: true,
          supportOrgProfile: {
            select: {
              organizationName: true,
              dateEstablished: true,
              supportOrgSector: {
                select:{
                  sectorId: true,
                }
              },
              address: true,
              organizationLogoUrl: true,
              coverPhotoUrl: true,
            }
          }
        }
      })
      return {
      ...profile,
    }
  }

    // Edit Organization Profile Picture
  async editOrganizationProfilePicture(userId: string, file: Express.Multer.File){
        // Fetch User by Id
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      `Failed to fetch user id ${userId}`,
    );

    // Check if user exists
    if (!user) {
      this.logger.warn(`No record for User: ${userId}`);
      throw new BadRequestException(`No record found`);
    }

    // Confirm file upload
    if (!file) {
      this.logger.warn(`No file uploaded for User: ${userId}`);
      throw new BadRequestException('No file uploaded');
    }

    // Upload to cloudinary
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              {
                folder: 'broach/profiles',
                public_id: `${userId}-OrgProfile`,
                overwrite: true,
                resource_type: 'image',
              },

              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error) {
                  reject(new InternalServerErrorException(error.message));
                  return;
                }
                if (!result) {
                  reject(new InternalServerErrorException('Upload failed'));
                  return;
                }
                resolve(result);
              },
            )
            .end(file.buffer);
        },
      );

      const profilePictureUrl = uploadResult.secure_url;
    // Update user's profile picture URL in DB
    if (user.userType === UserType.support_organization){
      const editedProfilePicture = await this.safeExecutor.run(
        () => this.prisma.supportOrgProfile.update({
          where: { userId },
          data: {organizationLogoUrl: profilePictureUrl},
        }) ,
      `Failed to update profile picture for user: ${userId}`,)

    this.logger.log(`Profile picture updated for user: ${userId}`);
    return editedProfilePicture
      }
    }

    // Update Cover Photo
/*       async editOrganizationCoverPhoto(userId: string, file: Express.Multer.File){
        // Fetch User by Id
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      `Failed to fetch user id ${userId}`,
    );

    // Check if user exists
    if (!user) {
      this.logger.warn(`No record for User: ${userId}`);
      throw new BadRequestException(`No record found`);
    }

    // Confirm file upload
    if (!file) {
      this.logger.warn(`No file uploaded for User: ${userId}`);
      throw new BadRequestException('No file uploaded');
    }

    // Upload to cloudinary
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              {
                folder: 'broach/profiles',
                public_id: `${userId}-coverphoto`,
                overwrite: true,
                resource_type: 'image',
              },

              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error) {
                  reject(new InternalServerErrorException(error.message));
                  return;
                }
                if (!result) {
                  reject(new InternalServerErrorException('Upload failed'));
                  return;
                }
                resolve(result);
              },
            )
            .end(file.buffer);
        },
      );

          // Extract uploaded image URL from Cloudinary (or any other service)
      const coverPhotoUrl = uploadResult.secure_url;


    // Update user's profile picture URL in DB
    if (user.userType === UserType.support_organization) {
      const editedCoverPhoto = await this.safeExecutor.run(
        () => this.prisma.supportOrgProfile.update({
          where: { userId },
          data: {coverPhotoUrl: coverPhotoUrl},
        }) ,
      `Failed to update profile picture for user: ${userId}`
      );
        this.logger.log(`Profile picture updated for user: ${userId}`);
        return editedCoverPhoto
    }
    }
 */
    
    
  async editOrganizationCoverPhoto(userId: string, file: Express.Multer.File) {

  // Fetch user by ID
    const user = await this.safeExecutor.run(
        () => this.prisma.user.findUnique({ where: { id: userId } }),
        `Failed to fetch user id ${userId}`,
      );

      // Validate user existence
      if (!user) {
        this.logger.warn(`No record for User: ${userId}`);
        throw new BadRequestException('User not found');
      }

      // Validate uploaded file
      if (!file) {
        this.logger.warn(`No file uploaded for User: ${userId}`);
        throw new BadRequestException('No file uploaded');
      }

      //  Upload image to Cloudinary
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        this.cloudinary.uploader
          .upload_stream(
            {
              folder: 'broach/profiles',
              public_id: `${userId}-coverphoto`,
              overwrite: true,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(new InternalServerErrorException(error.message));
              if (!result) return reject(new InternalServerErrorException('Upload failed'));
              resolve(result);
            },
          )
          .end(file.buffer);
      });

      // Update organization cover photo URL in the database
      const coverPhotoUrl = uploadResult.secure_url;

      if (user.userType === UserType.support_organization) {
        const updatedCoverPhoto = await this.safeExecutor.run(
          () =>
            this.prisma.supportOrgProfile.update({
              where: { userId },
              data: { coverPhotoUrl },
            }),
          `Failed to update cover photo for user: ${userId}`,
        );

        this.logger.log(`Organization cover photo updated for user: ${userId}`);
        return updatedCoverPhoto;
      }

      this.logger.warn(`Unsupported user type for cover photo update: ${user.userType}`);
      throw new BadRequestException('Unsupported user type for cover photo update');
    }
    
    // Edit Profile Details
    async editOrganizationProfileDetails(userId: string, dto: EditOrganizationProfileDto){
      // Build data to update
      const data: Prisma.SupportOrgProfileUpdateInput = {};

      if (dto.organizationName) data.organizationName = dto.organizationName;
      if (dto.dateEstablished) data.dateEstablished = dto.dateEstablished;
      /**
       * Update organization sectors.
       * For each provided sectorId, either connect to the existing SupportOrgSector (if the organization is already linked to that sector) or create a new ----
       * -----junction record linking this organization to the specified sector.
       * Uses Prisma’s `connectOrCreate` with the compound unique constraint
       * (sectorId + organizationId) to avoid duplicates in the SupportOrgSector table.
       */
      if (dto.sectors && dto.sectors.length > 0) {
        data.supportOrgSector = {
          connectOrCreate: dto.sectors.map((sectorId) => ({
            where: {
              sectorId_organizationId: {   // compound unique constraint
                sectorId,
                organizationId: userId,
              },
            },
            create: {
              sector: { connect: { id: sectorId } }, // link to existing Sector
            },
          })),
        };
      }
      if (dto.phone) {
        data.user = {
          update: {
            phone: dto.phone,
          }
        }
      }

      return this.safeExecutor.run(
        () => this.prisma.supportOrgProfile.update({
          where: { userId },
          data,
          include: {
            user: true,
          }
        }),
        `Failed to update profile for user: ${userId}`
      )

    } 
}










/* 
  async updateOrganizationProfile(
    dto: OrganizationProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    // Receive data from dto
    // const { ...dtos } = dto;

    // Fetch User by Id
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      `Failed to fetch user id ${userId}`,
    );

    // Check if user exists
    if (!user) {
      this.logger.warn(`No record for User: ${userId}`);
      throw new BadRequestException(`No record found`);
    }

    //  Handle profile picture

    // This initializes the logo url. variable that holds the final url parsed from cloudinary or falls back to what ever the user passes
    let organizationLogoUrl = dto.organizationLogo; // fallback to plain URL

    // Checks if file exists. If no file is uploaded, the fallback URL from the DTO is used.
    if (file) {
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              {
                folder: 'broach/profiles',
                public_id: `${userId}-profile`,
                overwrite: true,
                resource_type: 'image',
              },

              (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                if (error)
                  return reject(
                    new InternalServerErrorException(error.message),
                  );
                if (!result)
                  return reject(
                    new InternalServerErrorException(
                      'No upload result received',
                    ),
                  );
                resolve(result);
              },
            )
            .end(file.buffer);
        },
      );

      organizationLogoUrl = uploadResult.secure_url;
    }

    // const uniqueSectorIds = [...new Set(dto.sectors)];

    const existingSectors = await this.prisma.sector.findMany({
      where: { id: { in: dto.sectors } },
    });

    // Build data to update
    const data: Prisma.SupportOrgProfileUpdateInput = {
      user: { connect: { id: user?.id } },
      customSector: dto.customSector,
      dateEstablished: dto.dateEstablished
        ? new Date(dto.dateEstablished)
        : undefined,
      organizationSize: dto.organizationSize,
      address: dto.address,
      alternatePhone: dto.alternatePhone,
      ...(organizationLogoUrl ? { organizationLogo: organizationLogoUrl } : {}),
      sectors: {
        //set: [], // optional: clears old ones if you're updating
        connect: existingSectors.map((sector) => ({ id: sector.id })),
      },
    };

    //Update the requester profile data
    await this.safeExecutor.run(
      () =>
        this.prisma.supportOrgProfile.update({
          where: { userId },
          data,
        }),
      `Failed to update profile for user: ${userId}`,
    );
  } */
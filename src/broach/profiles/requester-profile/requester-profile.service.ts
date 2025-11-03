import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { EditRequesterProfileDto } from './dto/requester-profile.dto';
import { Prisma, UserType } from '@prisma/client';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class RequesterProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safeExecutor: SafeExecutor,
    private readonly logger: AppLogger,
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof import('cloudinary').v2,
  ) {}

  // Get a reporter's profile details by user ID
  async getRequesterProfileDetails(id: string) {
    const profile = await this.safeExecutor.run(
      () => this.prisma.user.findUnique({
        where: {id},
        select: {
          email: true,
          phone: true,
          requesterReporterProfile: {
            select: {
              fullName: true,
              dateOfBirth: true,
              occupation: true,
              location: true,
              profilePicture: true,
              coverPhoto: true,
            }
          }
        }
      }),
      `Failed to fetch profile for user: ${id}`)
    return {
      ...profile,
    }
  }

  // Edit Profile Picture
  async editProfilePicture(userId: string, file: Express.Multer.File){
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
                public_id: `${userId}-profile`,
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
    // Edit user's profile picture URL in DB
    if (user.userType === 'requester_reporter'){
      const editedProfilePicture = await this.safeExecutor.run(
        () => this.prisma.requesterReporterProfile.update({
          where: { userId },
          data: {profilePicture: profilePictureUrl},
        }) ,
      `Failed to update profile picture for user: ${userId}`,)
    this.logger.log(`Profile picture updated for user: ${userId}`);
    return editedProfilePicture;
    }    
    }

    // edit Cover Photo
      async editCoverPhoto(userId: string, file: Express.Multer.File){
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

      const coverPhotoUrl = uploadResult.secure_url;
    // Edit user's profile picture URL in DB
    if (user.userType === UserType.requester_reporter){
      const editedCoverPhoto = await this.safeExecutor.run(
        () => this.prisma.requesterReporterProfile.update({
          where: { userId },
          data: {coverPhoto: coverPhotoUrl},
        }) ,
      `Failed to update profile picture for user: ${userId}`,)
      this.logger.log(`Profile picture updated for user: ${userId}`);
      return editedCoverPhoto;
    }
    
    }

    // Edit Profile Details
    async editProfileDetails(userId: string, dto: EditRequesterProfileDto){
      // Build data to update
      const data: Prisma.RequesterReporterProfileUpdateInput = {};

      if (dto.occupation) data.occupation = dto.occupation;
      if (dto.dateOfBirth) data.dateOfBirth = new Date(dto.dateOfBirth);
      if (dto.location) data.location = dto.location;
      if (dto.fullName) data.fullName = dto.fullName;
      if (dto.phone) {
        data.user = {
          update: {
            phone: dto.phone,
          }
        }
      }

      return this.safeExecutor.run(
        () => this.prisma.requesterReporterProfile.update({
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

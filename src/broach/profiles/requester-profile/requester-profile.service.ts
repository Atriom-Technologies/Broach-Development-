import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppLogger } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { RequesterProfileDto } from './dto/requester-profile.dto';
import { Prisma } from '@prisma/client';
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

  async updateRequesterProfile(
    dto: RequesterProfileDto,
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
    let profilePictureUrl = dto.profilePicture; // fallback to plain URL

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

      profilePictureUrl = uploadResult.secure_url ?? dto.profilePicture;
      // profilePictureUrl = uploadResult.secure_url ?? dto.profilePicture;
    }

    // Build data to update
    const data: Prisma.RequesterReporterProfileUpdateInput = {
      user: { connect: { id: user?.id } },
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      occupation: dto.occupation,
      ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
    };

    this.logger.debug(`Update data for ${userId}: ${JSON.stringify(data)}`);

    //Update the requester profile data
    await this.safeExecutor.run(
      () =>
        this.prisma.requesterReporterProfile.update({
          where: { userId },
          data,
        }),
      `Failed to update profile for user: ${userId}`,
    );

    return {
      success: true,
      message: {
        title: 'Profile updated',
      },
    };
  }
}

import {
  Body,
  Controller,
  Req,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { RequesterProfileService } from './requester-profile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { UserType } from '@prisma/client';
import { EditRequesterProfileDto } from './dto/requester-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';

@ApiTags('Requester Profile')
@ApiBearerAuth()
@Controller('user')
export class RequesterProfileController {
  constructor(
    private readonly requesterProfileService: RequesterProfileService,
  ) {}

    // Get Requester Profile Details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  @Get('profile')
  async getUserProfileDetails(@Req() req: RequestWithUserPayload) {
    const id = req.user.id;
    const result = await this.requesterProfileService.getRequesterProfileDetails(id)
    return {
      fullName: result.requesterReporterProfile?.fullName,
      email: result.email,
      phone: result.phone,
      dob: result.requesterReporterProfile?.dateOfBirth,
      occupation: result.requesterReporterProfile?.occupation,
      location: result.requesterReporterProfile?.location,
      profilePictureUrl: result.requesterReporterProfile?.profilePicture,
      coverPhotoUrl: result.requesterReporterProfile?.coverPhoto,
    }
  }

  // Edit Requester Profile Picture
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
    @UseInterceptors(
    FileInterceptor('profilePicture', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPG/PNG images are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @Patch('profile/picture')
  async updateRequesterProfilePicture(
    @Req() req: RequestWithUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ){
    const userId = req.user.id; // from auth guard
    const result =  await this.requesterProfileService.editProfilePicture(userId, file);
    return {
      message: 'Profile picture updated successfully',
      imageUrl: result?.profilePicture
    } 
  }

  // Edit Cover Photo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
    @UseInterceptors(
    FileInterceptor('coverPhoto', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Only JPG/PNG images are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @Patch('profile/cover')
  async updateCoverPhoto(
    @Req() req: RequestWithUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ){
    const userId = req.user.id; // from auth guard
    const result = await this.requesterProfileService.editCoverPhoto(userId, file);
    return {
      message: 'Cover photo updated successfully',
      imageUrl: result?.coverPhoto
    } 
  }

  // Edit Requester Profile-- TO make changes to existing profile details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  @Patch('profile')
  async editRequesterProfile(
    @Body() dto: EditRequesterProfileDto,
    @Req() req: RequestWithUserPayload,
  ) {
    const userId = req.user.id; // from auth guard
    const result = await this.requesterProfileService.editProfileDetails(userId, dto);
    return{
      success: true,
      message: 'Profile updated successfully',
    }
  }

}
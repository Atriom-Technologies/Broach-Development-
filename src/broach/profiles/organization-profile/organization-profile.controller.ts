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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { UserType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { OrganizationProfileService } from './organization-profile.service';
import { EditOrganizationProfileDto, OrganizationProfileDto } from './dto/organization-profile.dto';

@ApiTags('Organization Profile')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationProfileController {
  constructor(
    private readonly organizationProfileService: OrganizationProfileService,
  ) {}

  // Get Organization profiled details
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.support_organization)
    @Get('profile')
    async getOrganizationProfileDetails(@Req() req: RequestWithUserPayload) {
      const userId = req.user.id;
      const result = await this.organizationProfileService.getOrganizationProfileDetails(userId)
      return {
        organizationName: result.supportOrgProfile?.organizationName,
        email: result.email,
        phone: result.phone,
        dateFounded: result.supportOrgProfile?.dateEstablished,
        category: result.supportOrgProfile?.supportOrgSector,
        address: result.supportOrgProfile?.address,
        profilePictureUrl: result.supportOrgProfile?.organizationLogoUrl,
        coverPhotoUrl: result.supportOrgProfile?.organizationLogoUrl,
      }
    }

  // Edit Organization Profile Picture
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
    @UseInterceptors(
    FileInterceptor('organizationLogoUrl', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
      fileFilter: (req, file, cb) => {
          const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new BadRequestException('Only JPG and PNG images are allowed'),
              false,
            );
        }
        cb(null, true);
      },
    }),
  )
  @Patch('profile/picture')
  async editOrgProfilePicture(
    @Req() req: RequestWithUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ){
    const userId = req.user.id; // from auth guard
    const result = await this.organizationProfileService.editOrganizationProfilePicture(userId, file);
    return {
      message: 'Profile picture updated',
      imageUrl: result?.organizationLogoUrl
    } 
  }


  // Edit Cover Photo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
    @UseInterceptors(
    FileInterceptor('coverPhotoUrl', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
      fileFilter: (req, file, cb) => {
          const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new BadRequestException('Only JPG and PNG images are allowed'),
              false,
            );
        }
        cb(null, true);
      },
    }),
  )
  @Patch('profile/cover')
  async editCoverPhoto(
    @Req() req: RequestWithUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ){
    const userId = req.user.id; // from auth guard
    const result = await this.organizationProfileService.editOrganizationCoverPhoto(userId, file);
    return {
      message: 'Cover photo updated successfully',
      imageUrl: result.coverPhotoUrl
    } 
  }
   

  // Edit one or more Organization Profile details-- TO make changes to existing profile details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  @Patch('profile')
  async editRequesterProfile(
    @Body() dto: EditOrganizationProfileDto,
    @Req() req: RequestWithUserPayload,
  ) {
    const userId = req.user.id; // from auth guard
    await this.organizationProfileService.editOrganizationProfileDetails(userId, dto);
    return{
      success: true,
      message: 'Profile updated',
    }
  }

}

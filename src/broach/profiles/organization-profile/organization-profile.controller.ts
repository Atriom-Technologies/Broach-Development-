import {
  Body,
  Controller,
  Req,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { UserType } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { OrganizationProfileService } from './organization-profile.service';
import { OrganizationProfileDto } from './dto/organization-profile.dto';

@ApiTags('Organization Profile')
@ApiBearerAuth()
@Controller('organization-profile')
export class OrganizationProfileController {
  constructor(
    private readonly organizationProfileService: OrganizationProfileService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  @Patch('update')
  @UseInterceptors(
    FileInterceptor('organizationLogo', {
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
  @ApiConsumes('multipart/form-data')
  async updateRequesterProfile(
    @Body() dto: OrganizationProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUserPayload,
  ) {
    const userId = req.user.id; // from auth guard
    return this.organizationProfileService.updateOrganizationProfile(
      dto,
      userId,
      file,
    );
  }
}

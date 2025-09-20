import { Body, Controller, Req, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { RequesterProfileService } from './requester-profile.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { UserType } from '@prisma/client';
import { RequesterProfileDto } from './dto/requester-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';




@ApiTags('Requester Profile')
@ApiBearerAuth()
@Controller('requester-profile')
export class RequesterProfileController {
    constructor(private readonly requesterProfileService: RequesterProfileService){}
    
    
    @Patch('update')
    @UseInterceptors(FileInterceptor('profilePicture', 
        {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only JPG/PNG images are allowed'), false);
      }
      cb(null, true);
    },
  }
    ))
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.requester_reporter)
    @ApiConsumes('multipart/form-data')
    async updateRequesterProfile(
        @Body() dto: RequesterProfileDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: RequestWithUserPayload
    ) {
    const userId = req.user.id; // from auth guard
    return this.requesterProfileService.updateRequesterProfile(dto, userId, file);
    }
}




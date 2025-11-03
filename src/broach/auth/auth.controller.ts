import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Req,
  UseGuards,
  Delete,
  Get,
  UseInterceptors,
  BadRequestException,
  Patch,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterReqRepDto, RequesterCompleteProfileDto } from './dto/requestDtos/register-req-rep.dto';
import { CompleteSupportOrgProfileDto, RegisterSupportOrgDto } from './dto/requestDtos/register-support-org.dto';
import { UserType } from '@prisma/client';
import { LoginDto } from './dto/requestDtos/login.dto';
import { Ip } from 'src/common/decorators/ip.decorator';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';
import { RefreshDto } from './dto/requestDtos/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestWithUserPayload } from './interfaces/jwt-payload.interface';
import {
  ForgotPassword,
  ResetPassword,
} from './dto/requestDtos/forgot-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  healthCheck() {
    return 'OK';
  }


  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Email or phone already in use.',
  })
  async registerRequestReporter(@Body() dto: RegisterReqRepDto) {
    const result = await this.authService.registerRequesterReporter(
      dto,
      UserType.requester_reporter,
    );

      return {
        "message": "Registration Successful",
        userId: result.id,  // Match Kotlin exactly
      };
  }

    // Complete Requester Profile
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
    @ApiConsumes('multipart/form-data')
    @Patch('register')
    async completeRequesterProfile(
      @Body() dto: RequesterCompleteProfileDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      const userType =  UserType.requester_reporter

      await this.authService.completeRequesterProfile(
        dto,
        userType,
        file,
      );
      return {
        message: `Profile updated successfully.`
      }
    }

  @Post('register/organization')
  @HttpCode(HttpStatus.CREATED)
  async registerSupportOrg(@Body() dto: RegisterSupportOrgDto) {
    const result = await this.authService.registerSupportOrganization(
      dto,
      UserType.support_organization,
    );

      return {
        "message": "Registration Successful",
        userId: result.id,  // Match Kotlin exactly
      };
  }


    // Complete organization Profile
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
    @Patch('register/organization')
    async completeSupportOrgProfile(
      @Body() dto: CompleteSupportOrgProfileDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      const userType =  UserType.support_organization

      await this.authService.completeSupportOrgProfile(
        dto,
        userType,
        file,
      );
      return {
        message: `Profile updated successfully.`
      }
    }


  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string, // custom decorator or raw req.ip
    @UserAgent() userAgent: string, // custom decorator or manual extraction
  ) {
    const result = await this.authService.login(dto, ipAddress, userAgent);
    return {
      message: "Login successful",
      authToken: result.accessToken,
      UserType: result.userType,
      isDetailsSubmitted: result.isProfileDetailsSubmitted,
      name: result.username,
      imageUrl: result.imageUrl,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(
    @Req() req: RequestWithUserPayload, // user info from decoded JWT
  ) {
    const sessionId = req.user.sessionId
    await this.authService.logout(sessionId, req.user.id);
    return {
        "message": "Logout Successful",
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto, @Req() req: RequestWithUserPayload) {
    const sessionId = req.user.sessionId
    await this.authService.refresh(dto, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout-all')
  async logoutAll(@Req() req: RequestWithUserPayload) {
    const result = await this.authService.logoutAllSessions(req.user.id);
      return {
        "message": "logged out of all devices",
        result
      };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPassword) {
    const result = await this.authService.requestPasswordReset(dto);
    return {
      message: `Click on this link ${result.rawToken} to reset your password,
      Bro just carry the token from here i never prepare the email service`,
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPassword, @Req() req: RequestWithUserPayload) {
    const userId = req.user.id
    const result = await this.authService.resetPassword(dto, userId);
    return {
      message:  'Password Reset Successful'
    }
  }
}

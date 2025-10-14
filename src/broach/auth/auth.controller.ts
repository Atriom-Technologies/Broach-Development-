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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterReqRepDto } from './dto/requestDtos/register-req-rep.dto';
import { RegisterSupportOrgDto } from './dto/requestDtos/register-support-org.dto';
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

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      status: 'success',
      message: result.message,
      data: result.user,
    };
  }

  @Post('register/organization')
  @HttpCode(HttpStatus.CREATED)
  async registerSupportOrg(@Body() dto: RegisterSupportOrgDto) {
    const result = await this.authService.registerSupportOrganization(
      dto,
      UserType.support_organization,
    );

    return {
      status: 'success',
      message: result.message,
      data: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string, // custom decorator or raw req.ip
    @UserAgent() userAgent: string, // custom decorator or manual extraction
  ) {
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout/:sessionId')
  logout(
    @Param('sessionId') sessionId: string,
    @Req() req: RequestWithUserPayload, // user info from decoded JWT
  ) {
    return this.authService.logout(sessionId, req.user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout-all')
  async logoutAll(@Req() req: RequestWithUserPayload) {
    return this.authService.logoutAllSessions(req.user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPassword) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPassword) {
    return this.authService.resetPassword(dto);
  }
}

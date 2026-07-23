import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestWithUserPayload, UserFromJwt } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { CursorPaginationDto } from './dto/pagination.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter) // Only requester_reporter can create cases
  async createCase(@Body() dto: CreateCaseDto, @CurrentUser() user: UserFromJwt) {
    const userId = user.id; // Extract user ID from the request
    const result = await this.casesService.createCase(dto, userId);
    return {
      success: true,
      caseId: result.caseId,
      message: {
        title: 'Case Reported',
        body: 'Your case has been submitted successfully. It will be reviewed and reported to relevant organizations as necessary. You will be notified of any update regarding your case in your message tab. Check regularly for updates. Remember, false report can have serious consequences, so ensure that the information you provide is accurate and truthful.',
      },
    };
  }

  @Get('reporter-requester')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  getReporterCaseHistory(@Query() dto: CursorPaginationDto) {
    return this.casesService.getReporterCaseHistory(dto);
  }

  @Get('org')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  getOrgCaseHistory(@Query() dto: CursorPaginationDto) {
    return this.casesService.getOrgCaseHistory(dto);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  claimCase(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.claimCase(caseId, user.id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  rejectCase(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.rejectCase(caseId, user.id);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  resolveCase(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.resolveCase(caseId, user.id);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  withdrawCase(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.withdrawCase(caseId, user.id);
  }

  @Get(':id/org-view')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  getCaseForOrg(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.getCaseForOrg(caseId, user.id);
  }

  @Get(':id/reporter-view')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  getCaseForReporter(@Param('id') caseId: string, @CurrentUser() user: UserFromJwt) {
    return this.casesService.getCaseForReporter(caseId, user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async updateCase(@Param('id') id: string, @Body() dto: UpdateCaseDto, @Req() req: RequestWithUserPayload) {
    const userId = req.user.id; // Extract user ID from the request

    await this.casesService.updateCase(id, userId, dto);
    return {
      success: true,
      message: 'Your case report has been updated successfully',
    };
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async deleteCase(@Param('id') id: string, @Req() req: RequestWithUserPayload) {
    const userId = req.user.id;
    await this.casesService.softDeleteCase(id, userId);
    return {
      success: true,
      message: {
        title: 'Case Deleted',
      },
    };
  }
}

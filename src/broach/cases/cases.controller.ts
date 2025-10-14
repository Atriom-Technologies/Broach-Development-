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
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Request } from 'express';

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter) // Only requester_reporter can create cases
  async createCase(
    @Body() dto: CreateCaseDto,
    @Req() req: RequestWithUserPayload,
  ) {
    const userId = req.user.id; // Extract user ID from the request
    await this.casesService.createCase(dto, userId);
    return {
      success: true,
      message: {
        title: 'Case Reported',
        body: 'Your case has been submitted successfully. It will be reviewed and reported to the relevant organizations as necessary. you will be notified of any updates regarding your case in your message tab. Check regularly for updates. Please remember that false reporting can have serious consequences, so ensure that the information you provide is accurate and truthful.',
      },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  getAllCases(@Query() dto: PaginationDto) {
    return this.casesService.getAllCases(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async updateCase(
    @Param('id') id: string,
    @Body() dto: UpdateCaseDto,
    @Req() req: RequestWithUserPayload,
  ) {
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
  async deleteCase(
    @Param('id') id: string,
    @Req() req: RequestWithUserPayload,
  ) {
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

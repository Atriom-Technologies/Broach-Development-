import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Service Request')
@ApiBearerAuth()
@Controller('service')
export class ServiceRequestController {
  constructor(private readonly serviceRequest: ServiceRequestService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async createServiceRequest(
    @Body() dto: BioDetailsDto,
    @Req() req: RequestWithUserPayload,
  ): Promise<ApiResponse> {
    const userId = req.user.id; // Extract user ID from the request
    await this.serviceRequest.createServiceRequest(dto, userId);
    return {
      success: true,
      message: {
        title: 'Service Request Sent',
        body: 'Your request has been sent and you will be getting a response soon. Please keep checking your messages, you will be adequately notified when response is ready.',
      },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async getAllServiceRequests(@Query() dto: PaginationDto) {
    return this.serviceRequest.getAllServiceRequests(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async getServiceRequest(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.serviceRequest.getServiceRequest(id);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async updateCase(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUserPayload,
    @Body() dto: UpdateServiceDto,
  ) {
    const userId = req.user.id; // Extract user ID from the request
    await this.serviceRequest.updateServiceRequest(id, userId, dto);
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUserPayload,
  ) {
    const userId = req.user.id; // Extract user ID from the request
    await this.serviceRequest.deleteServiceRequest(id, userId);
    return {
      success: true,
      message: {
        title: 'Case Deleted',
      },
    };
  }
}

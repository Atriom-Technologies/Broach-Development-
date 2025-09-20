import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/broach/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { BioDetailsDto } from './dto/create-service-request.dto';
import { RequestWithUserPayload } from 'src/broach/auth/interfaces/jwt-payload.interface';
import { ApiResponse } from 'src/common/dto/api-response.dto';

@ApiTags('Service Request')
@ApiBearerAuth()
@Controller('cases')
export class ServiceRequestController {
    constructor(private readonly serviceRequest: ServiceRequestService) {}

    @Post('request-service')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.requester_reporter)
    async createServiceRequest(@Body() dto: BioDetailsDto, @Req() req: RequestWithUserPayload):Promise<ApiResponse> {
        const userId = req.user.id; // Extract user ID from the request
        return this.serviceRequest.createServiceRequest(dto, userId);
    }
}

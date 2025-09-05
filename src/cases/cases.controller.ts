import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithUserPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
export class CasesController {
    constructor(private readonly casesService: CasesService) {}

    @Post('report-case')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.requester_reporter) // Only requester_reporter can create cases
    async createCase(@Body() dto: CreateCaseDto, @Req() req: RequestWithUserPayload) {
        const userId = req.user.id; // Extract user ID from the request
        return this.casesService.createCase(dto, userId);
    }
}

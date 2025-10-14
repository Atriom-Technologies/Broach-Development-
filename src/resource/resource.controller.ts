import { Controller, Get } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  // Get all case types
  @Get('case-types')
  async getAllCaseTypes() {
    return this.resourceService.getAllCaseTypes();
  }
  // Get all vulnerability statuses
  @Get('vulnerability-statuses')
  async getAllVulnerabilityStatuses() {
    return this.resourceService.getAllVulnerabilityStatuses();
  }
  // Get all service types
  @Get('service-types')
  async getAllServiceTypes() {
    return this.resourceService.getAllServiceTypes();
  }

  // Get all sectors
  @Get('sectors')
  async getAllSectors() {
    return this.resourceService.getAllSectors();
  }
}

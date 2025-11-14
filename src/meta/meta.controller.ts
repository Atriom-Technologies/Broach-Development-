import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  // Return all enums
  @ApiOperation({ summary: 'Fetch enums and lookup data for dropdowns or selects' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Specify which enum or lookup table to fetch (optional).',
    enum: [
      // Enums
      'userType',
      'gender',
      'organizationSize',
      'whoIsReporting',
      'location',
      'caseStatus',
      'ageRange',
      'employmentStatus',
      'noOfAssailants',
      'maritalStatus',
      // Lookup Tables
      'sectors',
      'caseTypes',
      'serviceTypes',
      'vulnerabilityStatuses',
    ],
    example: 'caseTypes',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns either all enums/lookups or a single type if provided.',
  })
  @Get()
  async getMeta(@Query('type') type?: string) {
    // Single enum fetch
    const enums = await this.metaService.getEnums();
    const lookups = await this.metaService.getLookupTables();

    if (!type) {
      // return all metadata
      return { enums, lookups };
    }

    // Check if requested type exists in enums
    if (enums[type]) return { [type]: enums[type] };

    // Check if requested type exists in lookup tables
    if (lookups[type]) return { [type]: lookups[type] };

    // If type is not recognized, return empty
    return { [type]: [] };
  }
}

import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LookupService, LookupItem } from './lookup.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

// 1. Maintain a strict map of Swagger strings to our validated Lookup keys
const LOOKUP_MAPPING = {
  sectors: 'sector',
  caseTypes: 'caseType',
  serviceTypes: 'serviceType',
  vulnerabilityStatuses: 'vulnerabilityStatus',
} as const;

type LookupQueryKeys = keyof typeof LOOKUP_MAPPING;

@ApiTags('Meta')
@Controller('meta')
export class LookupController {
  // 2. Inject the unified LookupService
  constructor(private readonly lookupService: LookupService) {}

  @ApiOperation({ summary: 'Fetch enums and lookup data for dropdowns or selects' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Specify which enum or lookup table to fetch (optional).',
    enum: [
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
    // ---- OPTIMIZATION LAYER A: FETCH ALL PATH ----
    if (!type) {
      const enums = this.lookupService.getStaticEnums();

      // Fetch collections concurrently from Redis memory (<1ms)
      const [sectors, caseTypes, serviceTypes, vulnerabilityStatuses] = await Promise.all([
        this.lookupService.getDatabaseCollections('sector'),
        this.lookupService.getDatabaseCollections('caseType'),
        this.lookupService.getDatabaseCollections('serviceType'),
        this.lookupService.getDatabaseCollections('vulnerabilityStatus'),
      ]);

      return {
        enums,
        lookups: { sectors, caseTypes, serviceTypes, vulnerabilityStatuses },
      };
    }

    // ---- OPTIMIZATION LAYER B: EARLY EXIT SINGLE ENUM PATH ----
    // If they ask for a hardcoded enum, return it instantly. Zero Redis or DB roundtrips.
    const enums = this.lookupService.getStaticEnums();
    if (enums[type]) {
      return enums[type];
    }

    // ---- OPTIMIZATION LAYER C: TARGETED SINGLE DATABASE CACHE PATH ----
    // If they ask for a database table, resolve ONLY that specific key from Redis
    if (type in LOOKUP_MAPPING) {
      const targetModel = LOOKUP_MAPPING[type as LookupQueryKeys];
      return this.lookupService.getDatabaseCollections(targetModel);
    }

    // Enforce API contract sanity instead of silently failing with an empty array
    throw new BadRequestException(`The metadata type '${type}' is completely unrecognized.`);
  }
}

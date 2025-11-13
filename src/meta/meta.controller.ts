import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from 'src/broach/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Meta')
@Controller('meta')
@UseGuards(JwtAuthGuard)
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  // Return all enums
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

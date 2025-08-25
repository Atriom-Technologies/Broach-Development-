import { Module } from '@nestjs/common';
import { SupportOrgService } from './support-org.service';

@Module({
  providers: [SupportOrgService],
})
export class SupportOrgModule {}

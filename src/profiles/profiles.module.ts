import { Module } from '@nestjs/common';
import { RequesterReporterModule } from './requester-reporter/requester-reporter.module';
import { SupportOrgModule } from './support-org/support-org.module';

@Module({
  imports: [RequesterReporterModule, SupportOrgModule],
})
export class ProfilesModule {}

import { Module } from '@nestjs/common';
import { RequesterReporterService } from './requester-reporter.service';

@Module({
  providers: [RequesterReporterService],
})
export class RequesterReporterModule {}

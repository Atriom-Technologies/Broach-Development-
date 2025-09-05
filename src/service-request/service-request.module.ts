import { Module } from '@nestjs/common';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { SafeExecutor } from 'src/utils/safe-execute';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService, SafeExecutor]
})
export class ServiceRequestModule {}

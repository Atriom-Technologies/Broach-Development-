import { Module } from '@nestjs/common';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { ServiceRepository } from './service-repository/service.repository';
import { ConversationService } from '../conversation/conversation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService, SafeExecutor, ServiceRepository, ConversationService, PrismaService],
})
export class ServiceRequestModule {}

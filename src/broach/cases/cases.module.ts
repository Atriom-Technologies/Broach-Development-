import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { LoggerModule } from 'src/logger/logger.module';
import { CaseRepository } from './repository/case.repository';
import { NotificationService } from '../notification/notification.service';
import { ConversationService } from '../conversation/conversation.service';
import { LookupModule } from 'src/lookup/lookup.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule, LoggerModule, LookupModule],
  controllers: [CasesController],
  providers: [
    PrismaService,
    CasesService,
    SafeExecutor,
    CaseRepository,
    NotificationService,
    ConversationService,
    CaseRepository,
    ConversationService,
  ],
  exports: [CasesService, CaseRepository],
})
export class CasesModule {}

import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CasesService } from '../cases/cases.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { AppLogger } from 'src/logger/logger.service';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [CasesModule],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, CasesService, SafeExecutor, AppLogger],
  exports: [ConversationService],
})
export class ConversationModule {}

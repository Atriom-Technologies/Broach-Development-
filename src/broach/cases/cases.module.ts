import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { LoggerModule } from 'src/logger/logger.module';
import { CaseRepository } from './repository/case.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, LoggerModule, NotificationModule],
  controllers: [CasesController],
  providers: [CasesService, SafeExecutor, CaseRepository,],
})
export class CasesModule {}

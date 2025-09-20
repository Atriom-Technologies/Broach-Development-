import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CasesController],
  providers: [CasesService, SafeExecutor]
})
export class CasesModule {}

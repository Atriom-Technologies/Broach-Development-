import { Module } from '@nestjs/common';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppLogger } from 'src/logger/logger.service';

@Module({
  imports: [PrismaModule],
  controllers: [LookupController],
  providers: [LookupService, PrismaService, AppLogger],
  exports: [LookupService],
})
export class LookupModule {}

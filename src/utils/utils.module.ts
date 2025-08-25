import { Module } from '@nestjs/common';
import { SafeExecutor } from './safe-execute';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [SafeExecutor],
  exports: [SafeExecutor],
})
export class UtilsModule {}

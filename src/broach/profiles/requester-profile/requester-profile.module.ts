import { Module } from '@nestjs/common';
import { RequesterProfileService } from './requester-profile.service';
import { RequesterProfileController } from './requester-profile.controller';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider'; 
import { PrismaModule } from 'src/prisma/prisma.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { LoggerModule } from 'src/logger/logger.module';
@Module({
  imports: [ PrismaModule, LoggerModule],
  providers: [RequesterProfileService, CloudinaryProvider, SafeExecutor],
  controllers: [RequesterProfileController]
})
export class RequesterProfileModule {}

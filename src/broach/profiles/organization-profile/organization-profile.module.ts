import { Module } from '@nestjs/common';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SafeExecutor } from 'src/utils/safe-execute';
import { OrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileService } from './organization-profile.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [OrganizationProfileService, CloudinaryProvider, SafeExecutor],
  controllers: [OrganizationProfileController],
})
export class OrganizationProfileModule {}

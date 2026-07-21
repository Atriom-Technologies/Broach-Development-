import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ConversationService } from '../conversation/conversation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [NotificationController],
  providers: [NotificationService, ConversationService, PrismaService],
})
export class NotificationModule {}

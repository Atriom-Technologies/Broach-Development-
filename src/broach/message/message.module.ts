import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageGateway } from './message.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { WsJwtGuard } from './ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    MessageService,
    MessageGateway,
    PrismaService,
    WsJwtGuard,
    JwtService,
  ],
  controllers: [MessageController],
})
export class MessageModule {}

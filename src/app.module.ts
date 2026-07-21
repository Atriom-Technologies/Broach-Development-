import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './broach/auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UtilsModule } from './utils/utils.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CasesModule } from './broach/cases/cases.module';
import { ServiceRequestModule } from './broach/service-request/service-request.module';
import { RequesterProfileModule } from './broach/profiles/requester-profile/requester-profile.module';
import { OrganizationProfileModule } from './broach/profiles/organization-profile/organization-profile.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './broach/notification/notification.module';
import { LookupModule } from './lookup/lookup.module';
import { ConversationModule } from './broach/conversation/conversation.module';
import { MessageModule } from './broach/message/message.module';
import { BullModule } from '@nestjs/bullmq';
import { envValidationSchema } from './config/joi.validation';
import bullmqConfig from './config/bullmq.config';
import cacheConfig from './config/cache.config';
import { RedisCacheModule } from './common/redis/redis-cache.module';
import { QueueMOdule } from './common/queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: envValidationSchema,
      load: [bullmqConfig, cacheConfig],
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: config.get('bull')!,
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 5,
      },
    ]),

    PrismaModule,
    AuthModule,
    MessageModule,
    ConversationModule,
    MessageModule,
    LoggerModule,
    UtilsModule,
    CasesModule,
    ServiceRequestModule,
    RequesterProfileModule,
    OrganizationProfileModule,
    EventEmitterModule.forRoot(),
    LookupModule,
    NotificationModule,
    RedisCacheModule,
    QueueMOdule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

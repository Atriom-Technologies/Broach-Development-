import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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
import * as Joi from 'joi';

@Module({
  imports: [
    // Load environmental variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: Joi.object({
        BCRYPT_SALT_ROUNDS: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('15min').optional(),
        REFRESH_TOKEN_TTL: Joi.number().default(604800000), // default if fallback needed
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
    LoggerModule,
    UtilsModule,
    CasesModule,
    ServiceRequestModule,
    RequesterProfileModule,
    OrganizationProfileModule,
  ],
  controllers: [AppController,],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

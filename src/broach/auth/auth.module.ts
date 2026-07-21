import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { LoggerModule } from 'src/logger/logger.module';
import { UtilsModule } from 'src/utils/utils.module';
import { ProfileStatusProvider } from '../../helper/profile-status.provider';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    UtilsModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d', // Default expiration time for access tokens
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenService,
    SessionService,
    ProfileStatusProvider,
    CloudinaryProvider,
    PrismaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}

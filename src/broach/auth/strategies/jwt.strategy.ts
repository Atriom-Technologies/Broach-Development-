import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtPayload, UserFromJwt } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // Define the options for the JWT strategy
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ??
        (() => {
          throw new Error('Missing JWT_SECRET');
        })(),
    };
    // Call the parent constructor with the options
    super(options);
  }
  // Validate the JWT payload
  validate(payload: JwtPayload): UserFromJwt {
    return {
      id: payload.sub,
      email: payload.email,
      userType: payload.userType,
    };
  }
}

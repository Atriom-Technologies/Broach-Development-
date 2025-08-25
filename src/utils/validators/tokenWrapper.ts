// token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
  email: string;
  userType: string;
}

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async signAccessToken(payload: JwtPayload): Promise<string> {
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}

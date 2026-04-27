import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const authObjectToken = client.handshake.auth?.token;

    // Check both auth object and authorization headers
    const authHeader = client.handshake.headers?.authorization;
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    // 3. Check query parameters (fallback for some clients/proxies)
    const queryToken = client.handshake.query?.token;

    // Final selection
    const token = authObjectToken || headerToken || queryToken;

    if (!token || typeof token !== 'string') {
      console.error('No token found in handshake:', client.handshake); // Debug log
      throw new WsException('Unauthorized: No token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // Get the meta data. client.data is the offical socket.io store or place for custom data
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        userType: payload.userType,
        sessionId: payload.sessionId,
      };
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('JWT Error Details:', message);
      throw new WsException('Invalid or expired token');
    }
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshSession } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { getEnvOrThrow } from 'src/utils/get-env';
import { AppLogger } from 'src/logger/logger.service';
import { calculateExpiry } from 'src/utils/date.util';

import * as argon2 from 'argon2';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  // Create session with a hashed refresh token
  // save metadata like user agent, ip address, etc.
  async createSession(
    userId: string,
    refreshTokenRaw: string,
    ip: string,
    userAgent: string,
  ): Promise<RefreshSession> {
    const hashedRefreshToken = await argon2.hash(refreshTokenRaw);
    const refreshTokenTtl = getEnvOrThrow<number>(
      this.config,
      'REFRESH_TOKEN_TTL',
    );
    const expiresAt = new Date(Date.now() + refreshTokenTtl);
    return this.prisma.refreshSession.create({
      data: {
        userId,
        refreshToken: hashedRefreshToken,
        ipAddress: ip,
        userAgent,
        expiresAt,
      },
    });
  }

  // Find session by user ID
  async findSession(userId: string): Promise<RefreshSession[]> {
    return this.prisma.refreshSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Remove specific refresh session by ID
  async removeSession(
    sessionId: string,
    currentUserId: string,
  ): Promise<RefreshSession> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
    });
    //
    if (!session || session.userId !== currentUserId) {
      throw new ForbiddenException('Unauthorized session access');
    }
    return this.prisma.refreshSession.delete({
      where: { id: sessionId },
    });
  }

  // Remove all sessions for a user
  async removeAllSessionsForUser(userId: string): Promise<void> {
    await this.prisma.refreshSession.deleteMany({ where: { userId } });
  }

  // Validate refresh token by comparing the incoming raw token with the stored hashed token
  async validateRefreshToken(
    sessionId: string,
    refreshTokenRaw: string,
  ): Promise<RefreshSession> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (new Date() > session.expiresAt)
      throw new ForbiddenException('Refresh token expired');

    // Verify the hashed refresh token and return the session if valid
    const isValid = await argon2.verify(session.refreshToken, refreshTokenRaw);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');
    return session;
  }
  // Rotate session token by updating the refresh token and expiry date
  async rotateSessionToken(sessionId: string, newToken: string) {
    const hashed = await argon2.hash(newToken);
    const expiresAt = calculateExpiry(); // e.g. 30d from now

    return this.prisma.refreshSession.update({
      where: { id: sessionId },
      data: {
        refreshToken: hashed,
        expiresAt,
      },
    });
  }
}

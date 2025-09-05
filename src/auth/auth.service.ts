import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterReqRepDto } from './dto/requestDtos/register-req-rep.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';
import { RegisterSupportOrgDto } from './dto/requestDtos/register-support-org.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/requestDtos/login.dto';
import { RefreshDto } from './dto/requestDtos/refresh.dto';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AppLogger } from 'src/logger/logger.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly logger: AppLogger,
    private readonly safeExecutor: SafeExecutor,
  ) {}

  async registerRequesterReporter(dto: RegisterReqRepDto, userType: UserType) {
    // Get email, phone, password, confirmpassword except profile data
    const { email, phone, password, confirmPassword, ...profileData } = dto;

    // Check if password matches
    if (password !== confirmPassword) {
      this.logger.warn(
        `Registration failed: Password mismatch for email: ${dto.email}`,
      );
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists to avoid duplicate email or phone
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: User already exists with email: ${email} or phone: ${phone}`,
      );
      throw new ConflictException('User with this credentials already exist');
    }

    // Use safeExecutor injectable function to hash password securely
    // This ensures that any errors during hashing are logged and handled gracefully
    const hashedPassword = await this.safeExecutor.run(
      () => argon2.hash(password),
      'Failed to hash password during registration',
    );

    // Create user and requester profile
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.create({
          data: {
            email,
            phone,
            password: hashedPassword,
            userType,
            requesterReporterProfile: {
              create: {
                ...profileData,
                dateOfBirth: new Date(profileData.dateOfBirth),
              },
            },
          },
          include: {
            requesterReporterProfile: true,
          },
        }),
      'Failed to create User and Profile during registration',
    );

    return {
      success: true,
      message: 'Registration Successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profile: user.requesterReporterProfile,
      },
    };
  }

  async registerSupportOrganization(
    dto: RegisterSupportOrgDto,
    userType: UserType,
  ) {
    // Get email, phone, password, confirmpassword except profile data
    const { email, phone, password, confirmPassword, sectors, ...profileData } = dto;

    // Check if password matches
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists to avoid duplicate email or phone
    const existingUser = await this.safeExecutor.run(
      () =>
        this.prisma.user.findFirst({
          where: { OR: [{ email }, { phone }] },
        }),
      'Failed to check existing user during registration',
    );

    if (existingUser) {
      this.logger.warn(
        `Registration failed: User already exists with email: ${email} or phone: ${phone}`,
      );
      throw new ConflictException('User with this credentials already exist');
    }

    // Hash password securely
    const hashedPassword = await this.safeExecutor.run(
      () => argon2.hash(password),
      'Failed to hash password during registration',
    );

    if (!profileData.dateEstablished) {
  throw new BadRequestException('Date Established is required');
}

    // Create user and support organization profile
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.create({
          data: {
            email,
            phone,
            password: hashedPassword,
            userType,
            supportOrgProfile: {
              // create profile data with its nested sector relation
              create: {
                ...profileData,
                dateEstablished: new Date(profileData.dateEstablished),

                sectors: {
                  create: sectors.map((sector) => ({
                    sector
                  }))
                }
              },
            },
          },
          include: {
            supportOrgProfile: true,          },
        }),
      'Failed to create User and Support Organization Profile during registration',
    );
    return {
      success: true,
      message: 'Registration Successful',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profile: user.supportOrgProfile,
      },
    };
  }

  // Login logic
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    // Get email and password from dto
    const { email, password } = dto;

    // Find user by email
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { email },
          include: {
            requesterReporterProfile: true,
            supportOrgProfile: true,
          },
        }),
      'Failed to find user during login',
    );
    // If user not found, throw error
    if (!user) {
      this.logger.warn(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.safeExecutor.run(
      () => argon2.verify(user.password, password),
      'Failed to verify password during login',
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create access token
    const payLoad = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };
    const accessToken = await this.safeExecutor.run(
      () => this.tokenService.signAccessToken(payLoad),
      'Failed to sign access token during login',
    );

    // Create refresh token
    const refreshTokenRaw = this.safeExecutor.runSync(
      () => this.tokenService.signRefreshToken(),
      'Failed to sign refresh token during login',
    );

    // Store session
    const session = await this.safeExecutor.run(
      () =>
        this.sessionService.createSession(
          user.id,
          refreshTokenRaw,
          ipAddress,
          userAgent,
        ),
      'Failed to create session during login',
    );

    // Log successful login
    this.logger.log(`Login successful for ${user.email} from IP ${ipAddress}`);

    // Return tokens and user info
    return {
      message: 'Login successful',
      accessToken,
      refreshToken: refreshTokenRaw,
      sessionId: session.id,
      // user: {
      //   id: user.id,
      //   email: user.email,
      //   phone: user.phone,
      //   userType: user.userType,
      //   profile:
      //     user.userType === 'requester_reporter'
      //       ? user.requesterReporterProfile
      //       : user.supportOrgProfile,
      // },
    };
  }

  async logout(
    sessionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Validate session ID
    const session = await this.safeExecutor.run(
      () => this.prisma.refreshSession.findUnique({ where: { id: sessionId } }),
      'Failed to find session during logout',
    );
    // If session not found, throw error
    if (!session || session.userId !== userId) {
      this.logger.warn(
        `Logout failed for userId: ${userId}, sessionId: ${sessionId}`,
      );
      throw new ForbiddenException('Invalid session or unauthorized');
    }

    await this.safeExecutor.run(
      () => this.prisma.refreshSession.delete({ where: { id: sessionId } }),
      'Failed to delete session during logout',
    );

    this.logger.log(
      `User ${userId} successfully logged out from session ${sessionId}`,
    );
    return { message: 'Logout successful' };
  }

  async refresh(dto: RefreshDto) {
    // Extract refresh token and session ID from dto
    const { refreshToken, sessionId } = dto;

    // Fetch session ID
    const session = await this.safeExecutor.run(
      () => this.prisma.refreshSession.findUnique({ where: { id: sessionId } }),
      'Failed to fetch session during refresh',
    );

    // If session not found, throw error
    if (!session) {
      this.logger.warn(`Refresh failed: Session not found (id: ${sessionId})`);
      throw new UnauthorizedException('Invalid session');
    }

    // Verify refresh token
    const isValid = await this.safeExecutor.run(
      () => argon2.verify(session.refreshToken, refreshToken),
      'Failed to verify refresh token during refresh',
    );

    // If refresh token is invalid, delete session and throw error
    if (!isValid) {
      this.logger.warn(
        `Refresh token mismatch. Deleting session: ${sessionId}`,
      );
      await this.prisma.refreshSession.delete({ where: { id: sessionId } });
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Refresh token is valid then rotate tokens
    // fetch user for refresh
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: session.userId },
        }),
      'Failed to fetch user during refresh',
    );
    // If user not found, throw error
    if (!user) {
      this.logger.warn(
        `Refresh failed: User not found (id: ${session.userId})`,
      );
      throw new UnauthorizedException('Invalid user');
    }

    // Sign new tokens
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = await this.tokenService.signAccessToken(payload);
    const newRefreshToken = this.tokenService.signRefreshToken(); 

    // Rotate token in DB
    await this.safeExecutor.run(
      () => this.sessionService.rotateSessionToken(sessionId, newRefreshToken),
      'Failed to rotate session token during refresh',
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
    };
  }

  async logoutAllSessions(userId: string): Promise<{ message: string }> {
    const result = await this.safeExecutor.run(
      () => this.prisma.refreshSession.deleteMany({ where: { userId } }),
      'Failed to logout from all sessions',
    );

    this.logger.log(`User ${userId} logged out from ${result.count} sessions`);
    return { message: `You've logged out from all devices successfully` };
  }
}

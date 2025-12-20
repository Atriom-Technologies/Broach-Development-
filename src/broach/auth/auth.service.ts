import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RegisterReqRepDto,
  RequesterCompleteProfileDto,
} from './dto/requestDtos/register-req-rep.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserType } from '@prisma/client';
import {
  CompleteSupportOrgProfileDto,
  RegisterSupportOrgDto,
} from './dto/requestDtos/register-support-org.dto';
import { LoginDto } from './dto/requestDtos/login.dto';
import { RefreshDto } from './dto/requestDtos/refresh.dto';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AppLogger } from 'src/logger/logger.service';
import { SafeExecutor } from 'src/utils/safe-execute';
import { ForbiddenException } from '@nestjs/common';
import { ProfileStatusProvider } from '../../helper/profile-status.provider';
import {
  ForgotPassword,
  ResetPassword,
} from './dto/requestDtos/forgot-password.dto';
import { randomBytes } from 'crypto';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly logger: AppLogger,
    private readonly safeExecutor: SafeExecutor,
    private readonly profile: ProfileStatusProvider,
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof import('cloudinary').v2,
  ) {}

  async registerRequesterReporter(dto: RegisterReqRepDto, userType: UserType) {
    // Get email, phone, password, confirmpassword except profile data
    const { fullName, email, phone, password, confirmPassword } = dto;

    // Check if password matches
    if (password !== confirmPassword) {
      this.logger.warn(`Password mismatch for email: ${dto.email}`);
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user type is requester_reporter before proceeding
    if (userType !== UserType.requester_reporter) {
      this.logger.warn(`User ${dto.email} not a requester/reporter`);
      throw new UnauthorizedException(
        'Did you mean to register as an organization?',
      );
    }

    // Check if user exists to avoid duplicate email or phone
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: User already exists with email: ${email} or phone: ${phone}`,
      );
      throw new ConflictException('User already exist');
    }

    // Use safeExecutor injectable function to hash password securely
    // This ensures that any errors during hashing are logged and handled gracefully
    const hashedPassword = await this.safeExecutor.run(
      () => argon2.hash(password),
      'Failed to hash password during registration',
    );

    // Create user profile in user table with a temporary requester profile until the personal details are filled
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.create({
          data: {
            email,
            phone,
            password: hashedPassword,
            userType,
            requesterReporterProfile: {
              create: { fullName }, // A skeleton profile is created for the requester/reporter profile table with full name
            },
          },
          include: {
            requesterReporterProfile: true,
          },
        }),
      'Failed to create User and Profile during registration',
    );

    // Create refresh token
    const refreshTokenRaw = this.safeExecutor.runSync(
      () => this.tokenService.signRefreshToken(),
      'Failed to sign refresh token during login',
    );

    // Store session
    const session = await this.safeExecutor.run(
      () => this.sessionService.createSession(user.id, refreshTokenRaw),
      'Failed to create session during login',
    );

    // Create access token
    const payLoad = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      sessionId: session.id,
    };
    const accessToken = await this.safeExecutor.run(
      () => this.tokenService.signAccessToken(payLoad),
      'Failed to sign access token during login',
    );
    return {
      id: user.id,
      userType: user.userType,
      accessToken,
    };
  }

  // complete the profile creation from another page before login
  async completeRequesterProfile(
    dto: RequesterCompleteProfileDto,
    userType: UserType,
    userId: string,
    file?: Express.Multer.File,
  ) {
    // Check if user is reporter_requester before proceeding
    if (userType !== 'requester_reporter') {
      this.logger.warn(`User not a requester/reporter`);
      throw new UnauthorizedException(
        'Did you mean to register as an organization?',
      );
    }
    // Fetch User by Id to check if user exists
    //const id = dto.userId;
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      `Failed to fetch user id ${userId}`,
    );

    // Check if user exists
    if (!user) {
      this.logger.warn(`No record for User: ${userId}`);
      throw new BadRequestException(`No record found`);
    }

    //  Handle profile picture
    // let profilePictureUrl = dto.profilePicture; // fallback to plain URL
    let profilePicture: string | undefined;

    if (file) {
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              {
                folder: 'broach/profiles',
                public_id: `${user.id}-profile`,
                overwrite: true,
                resource_type: 'image',
              },

              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error) {
                  reject(new InternalServerErrorException(error.message));
                  return;
                }
                if (!result) {
                  reject(new InternalServerErrorException('Upload failed'));
                  return;
                }
                resolve(result);
              },
            )
            .end(file.buffer);
        },
      );

      profilePicture = uploadResult.secure_url;
      // profilePictureUrl = uploadResult.secure_url ?? dto.profilePicture;
    }

    /**
     * Prisma's upsert method is used here to either update an existing
     * requester reporter profile or create a new one if it doesn't exist.
     * This ensures that the profile is always in sync with the user's details.
     *
     * We split the payloads into create and update to handle optional fields properly.
     * For instance, if profilePicture is not provided during an update, we don't want to overwrite the existing picture with undefined.
     */

    //So, first we build the shared values
    const data: Prisma.RequesterReporterProfileUpdateInput = {
      user: { connect: { id: user.id } },
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      occupation: dto.occupation,
      location: dto.location,
      ...(profilePicture && { profilePicture }),
    };

    // // Then we split into seperate types for upsert
    // const updateData: Prisma.RequesterReporterProfileUpdateInput = {
    //   ...baseData,
    // }

    // const createData: Prisma.RequesterReporterProfileCreateInput = {
    //   ...baseData,
    //   user: { connect: { id } }, // reconnect user in create
    // }

    //Update the requester profile data
    const profile = await this.safeExecutor.run(
      () =>
        this.prisma.requesterReporterProfile.update({
          where: { userId: user.id },
          data,
        }),
      `Failed to update profile for user: ${user.id}`,
    );

    this.logger.debug(`Profile completed for user: ${user.id}`);

    return {
      name: profile.fullName,
      imageUrl: profile.profilePicture,
    };
  }

  // Organization Registration
  async registerSupportOrganization(
    dto: RegisterSupportOrgDto,
    userType: UserType,
  ) {
    // Get email, phone, password, confirmpassword except profile data
    const { organizationName, email, phone, password, confirmPassword } = dto;

    // Check if password matches
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user type is requester_reporter before proceeding
    if (userType !== UserType.support_organization) {
      this.logger.warn(`User ${dto.email} not a support organization`);
      throw new UnauthorizedException(
        'Did you mean to register as a Requester/reporter?',
      );
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
      throw new ConflictException('User already exist');
    }

    // Hash password securely
    const hashedPassword = await this.safeExecutor.run(
      () => argon2.hash(password),
      'Failed to hash password during registration',
    );

    /*     if (!profileData.dateEstablished) {
  throw new BadRequestException('Date Established is required');
} */

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
                organizationName, // prepopulating the support org table with its full name skeletally which will be updated with other datas later
                /*          ...profileData,
                dateEstablished: new Date(profileData.dateEstablished), */

                /*                 sectors: {
                  create: sectors.map((sector) => ({
                    sector
                  }))
                } */
              },
            },
          },
          include: {
            supportOrgProfile: true,
          },
        }),
      'Failed to create User and Support Organization Profile during registration',
    );

    // Create refresh token
    const refreshTokenRaw = this.safeExecutor.runSync(
      () => this.tokenService.signRefreshToken(),
      'Failed to sign refresh token during login',
    );

    // Store session
    const session = await this.safeExecutor.run(
      () => this.sessionService.createSession(user.id, refreshTokenRaw),
      'Failed to create session during login',
    );

    // Create access token
    const payLoad = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      sessionId: session.id,
    };
    const accessToken = await this.safeExecutor.run(
      () => this.tokenService.signAccessToken(payLoad),
      'Failed to sign access token during login',
    );
    return {
      id: user.id,
      userType: user.userType,
      accessToken,
    };
  }

  // complete the profile creation from another page before login
  async completeSupportOrgProfile(
    dto: CompleteSupportOrgProfileDto,
    userType: UserType,
    userId: string,
    file?: Express.Multer.File,
  ) {
    // Check if user is reporter_requester before proceeding
    if (userType !== UserType.support_organization) {
      this.logger.warn(`User not a Support Organization`);
      throw new UnauthorizedException(
        'Did you mean to register as reporter/requester?',
      );
    }
    // Fetch User by Id to check if user exists
    // const id = dto.userId;
    const user = await this.safeExecutor.run(
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
        }),
      `Failed to fetch user id ${userId}`,
    );

    // Check if user exists
    if (!user) {
      this.logger.warn(`No record for User: ${userId}`);
      throw new BadRequestException(`ID: ${userId} not found`);
    }

    //  Handle profile picture
    // let profilePictureUrl = dto.profilePicture; // fallback to plain URL
    let organizationLogoUrl: string | undefined;

    if (file) {
      const uploadResult = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(
              {
                folder: 'broach/profiles',
                public_id: `${user.id}-Organization-profile`,
                overwrite: true,
                resource_type: 'image',
              },

              (
                error: UploadApiErrorResponse | undefined,
                result: UploadApiResponse | undefined,
              ) => {
                if (error) {
                  reject(new InternalServerErrorException(error.message));
                  return;
                }
                if (!result) {
                  reject(new InternalServerErrorException('Upload failed'));
                  return;
                }
                resolve(result);
              },
            )
            .end(file.buffer);
        },
      );

      organizationLogoUrl = (uploadResult as UploadApiResponse).secure_url;
      // profilePictureUrl = uploadResult.secure_url ?? dto.profilePicture;
    }

    /**
     * Prisma's upsert method is used here to either update an existing
     * requester reporter profile or create a new one if it doesn't exist.
     * This ensures that the profile is always in sync with the user's details.
     *
     * We split the payloads into create and update to handle optional fields properly.
     * For instance, if profilePicture is not provided during an update, we don't want to overwrite the existing picture with undefined.
     */

    //So, first we build the shared values
    const data: Prisma.SupportOrgProfileUpdateInput = {
      user: { connect: { id: user.id } },
      address: dto.address,
      dateEstablished: dto.dateEstablished
        ? new Date(dto.dateEstablished)
        : undefined,
      organizationSize: dto.organizationSize,
      alternatePhone: dto.alternatePhone,
      ...(organizationLogoUrl && { organizationLogoUrl }),
      supportOrgSector: {
        deleteMany: {}, // remove existing links
        create: dto.sectorId.map((sectorId) => ({ sectorId })) || [],
      },
    };

    // // Then we split into seperate types for upsert
    // const updateData: Prisma.RequesterReporterProfileUpdateInput = {
    //   ...baseData,
    // }

    // const createData: Prisma.RequesterReporterProfileCreateInput = {
    //   ...baseData,
    //   user: { connect: { id } }, // reconnect user in create
    // }

 
          const exists = await this.prisma.supportOrgProfile.findUnique({
        where: { userId: user.id },
      });
      
      if (!exists) {
        throw new BadRequestException(
          'Support organization profile was not initialized during registration',
        );
      }
    //Update the requester profile data
    const profile = await this.safeExecutor.run(
      () =>
        this.prisma.supportOrgProfile.update({
          where: { userId: user.id },
          data,
          include: {
            supportOrgSector: true,
          },
        }),
      `Failed to update profile for user: ${user.id}`,
    );

     this.logger.debug(`Profile completed for user: ${user.id}`);

    return {
      name: profile.organizationName,
      imageUrl: profile.organizationLogoUrl,
    };
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = dto;

    // --- Find user (expected failure, no SafeExecutor) ---
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        requesterReporterProfile: true,
        supportOrgProfile: true,
      },
    });

    // Login failure: email not found
    if (!user) {
      this.logger.warn(
        `Login failed: Email not found - ${email} from IP ${ipAddress}`,
      );
      throw new UnauthorizedException('Login failed');
    }

    // Verify password (expected failure, no SafeExecutor)
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password - ${email} from IP ${ipAddress}`,
      );
      throw new UnauthorizedException('Login failed');
    }

    try {
      // --- Create refresh token (system error, use SafeExecutor) ---
      const refreshTokenRaw = await this.safeExecutor.runSync(
        () => this.tokenService.signRefreshToken(),
        'Failed to sign refresh token during login',
      );

      // --- Store session ---
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

      // --- Create access token ---
      const payload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
        sessionId: session.id,
      };

      const accessToken = await this.safeExecutor.run(
        () => this.tokenService.signAccessToken(payload),
        'Failed to sign access token during login',
      );

      // --- Check profile completion ---
      const isProfileDetailsSubmitted =
        await this.profile.isProfileDetailsSubmitted(user.id);

      // Log successful login
      this.logger.log(`Login successful for ${email} from IP ${ipAddress}`);

      // --- Return user info + tokens ---
      return {
        accessToken,
        refreshToken: refreshTokenRaw,
        sessionId: session.id,
        isProfileDetailsSubmitted,
        id: user.id,
        userType: user.userType,
        username:
          user.userType === 'requester_reporter'
            ? user.requesterReporterProfile?.fullName
            : user.supportOrgProfile?.organizationName,
        imageUrl:
          user.userType === 'requester_reporter'
            ? user.requesterReporterProfile?.profilePicture
            : user.supportOrgProfile?.organizationLogoUrl,
      };
    } catch (err) {
      // Only unexpected errors are logged
      this.logger.error(`Unexpected login error for ${email}`, err.stack);
      throw new InternalServerErrorException(
        'Login failed due to system error',
      );
    }
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    const session = await this.safeExecutor.run(
      () => this.prisma.refreshSession.findUnique({ where: { id: sessionId } }),
      'Failed to find session during logout',
    );

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
  }

  async refresh(dto: RefreshDto, sessionId: string) {
    // Extract refresh token and session ID from dto
    const { refreshToken } = dto;

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
      sessionId: session.id,
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

  async logoutAllSessions(userId: string): Promise<number> {
    const result = await this.safeExecutor.run(
      () => this.prisma.refreshSession.deleteMany({ where: { userId } }),
      'Failed to logout from all sessions',
    );

    this.logger.log(`User ${userId} logged out from ${result.count} sessions`);
    return result.count;
  }

  // Forgot password flow
  async requestPasswordReset(dto: ForgotPassword) {
    // Fetch email from dto
    const { email } = dto;
    // Fetch user by email from user table
    const user = await this.safeExecutor.run(
      () => this.prisma.user.findUnique({ where: { email } }),
      `Password Reset requested for non existing email: ${email}`,
    );

    // Throw error to client if no user is found
    if (!user) throw new NotFoundException('User does not exist');

    // If found, generate a reset token
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = await this.safeExecutor.run(
      () => argon2.hash(rawToken),
      `Failed to hash token for user ${user.email}`,
    );

    // get expiry time from env file
    const expiry = this.configService.getOrThrow<number>(
      'PASSWORD_RESET_EXPIRY',
    );

    // set it to expire in 10mins
    const expiresAt = new Date(Date.now() + expiry * (60 * 1000));

    // Save hashed token to databse
    const resetToken = await this.safeExecutor.run(
      () =>
        this.prisma.passwordReset.upsert({
          where: { userId: user.id },
          update: {
            token: hashedToken,
            expiresAt,
          },
          create: {
            userId: user.id,
            token: hashedToken,
            expiresAt,
          },
        }),
      `Failed to store reset password token for user ${user.email}`,
    );

    return {
      email: user.email,
      rawToken, // will be used internally to send email
      expiresAt,
    };
  }

  // Reset password flow
  async resetPassword(dto: ResetPassword, userId: string) {
    const { token, newPassword, confirmPassword } = dto;

    const userToken = await this.prisma.passwordReset.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!userToken) throw new UnauthorizedException('Reset link expired');

    const isValid = await argon2.verify(userToken.token, token);
    if (!isValid) throw new UnauthorizedException('Invalid token');

    if (newPassword !== confirmPassword) {
      this.logger.warn(
        `Password reset failed: new Password mismatch for userId: ${userId}`,
      );
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      await tx.passwordReset.delete({
        where: { id: userToken.id }, // IMPORTANT FIX
      });

      await tx.refreshSession.deleteMany({ where: { userId } });
    });
  }

  /*   async resetPassword(dto: ResetPassword) {
    // Retrieve userId and token from client/dto
    const [token, userId, newPassword, confirmPassword] = dto.token.split(':');

    // Extract hashed token from database using the expiresAt field and userID. it auto fetches the whole record for that table
    const userToken = await this.safeExecutor.run(
      () =>
        this.prisma.passwordReset.findFirst({
          where: {
            userId,
            expiresAt: { gt: new Date() }, // Fetches records that are not expired
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      `Failed to fetch password reset records`,
    );

    if (!userToken) throw new UnauthorizedException('Your session has expired');

    // Validate the token with the hashed token in the database for the user
    const isValid = await this.safeExecutor.run(
      () => argon2.verify(userToken.token, token),
      'Token verification failed',
    );

    // if token is not valid, throws an exception else, next flow
    if (!isValid) throw new UnauthorizedException('Token invalid');

    if (newPassword !== confirmPassword) {
      this.logger.warn(
        `Password reset failed: new Password mismatch for email: ${userId}`,
      );
      throw new BadRequestException('Passwords do not match');
    }    
    // Hash the password
    const hashedPassword = await this.safeExecutor.run(
      () => argon2.hash(newPassword),
      'Failed to hash password',
    );

    // update user password
    await this.safeExecutor.run(
      () =>
        this.prisma.user.update({
          where: { id: userToken.userId },
          data: { password: hashedPassword },
        }),
      'Failed to update password',
    );

    // Delete used reset record
    await this.safeExecutor.run(
      () =>
        this.prisma.passwordReset.delete({
          where: { userId },
        }),
      'Failed to delete record',
    );

    //Clear all refresh sessions
    await this.safeExecutor.run(
      () =>
        this.prisma.refreshSession.deleteMany({
          where: { userId },
        }),
      'Failed to clear sessions',
    );

  } */
}

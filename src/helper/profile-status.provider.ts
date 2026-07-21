import { PrismaService } from 'src/prisma/prisma.service';
import { UserType, RequesterReporterProfile, SupportOrgProfile } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { SupportOrgProfileDto } from '../broach/auth/dto/responseDtos/support-org-profile.dto';

@Injectable()
export class ProfileStatusProvider {
  constructor(private readonly prisma: PrismaService) {}
  // userType: UserType

  async isProfileDetailsSubmitted(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        requesterReporterProfile: true,
        supportOrgProfile: true,
      },
    });

    if (!user) return false;

    // Check profile based on user type
    if (user.userType === UserType.requester_reporter) {
      const profile = user.requesterReporterProfile as RequesterReporterProfile | null;
      if (!profile) return false;

      // Check required fields for requester_reporter profile
      const requiredFields: (keyof RequesterReporterProfile)[] = [
        'fullName',
        'gender',
        'dateOfBirth',
        'occupation',
        'profilePicture',
        'location',
      ];

      return requiredFields.every(
        (field) => profile[field] !== null && profile[field] !== undefined && profile[field] !== '',
      );
    }

    // Support Organization Profile Check
    if (user.userType === UserType.support_organization) {
      const profile = user.supportOrgProfile as SupportOrgProfileDto | null;
      if (!profile) return false;

      const requiredFields: (keyof SupportOrgProfile)[] = [
        'organizationName',
        'dateEstablished',
        'organizationSize',
        'address',
        'alternatePhone',
        'organizationLogoUrl',
      ];

      return requiredFields.every(
        (field) => profile[field] !== null && profile[field] !== undefined && profile[field] !== '',
      );
    }
    return false;
  }
}

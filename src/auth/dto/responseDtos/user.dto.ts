import { UserType } from '@prisma/client';
import { RequesterProfileDto } from './req-rep-profile.dto';
import { SupportOrgProfileDto } from './support-org-profile.dto';

export class UserDto {
  id: string;
  email: string;
  phone: string;
  userType: UserType;
  profile: RequesterProfileDto | SupportOrgProfileDto;
}

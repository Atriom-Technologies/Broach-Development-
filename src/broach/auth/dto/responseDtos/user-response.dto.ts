/* import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { RequesterReporterProfileDto } from '../requestDtos/requester-profile.dto';
// import { SupportOrgProfileDto } from '../requestDtos/support-org-profile.dto';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserType })
  userType: UserType;

  @ApiProperty({
    oneOf: [
      { $ref: RequesterReporterProfileDto.name },
      { $ref: SupportOrgProfileDto.name },
    ],
  })
  profile: RequesterReporterProfileDto | SupportOrgProfileDto;
}
 */
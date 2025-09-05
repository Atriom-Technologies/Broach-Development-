import { ApiProperty } from '@nestjs/swagger';
import { OrgSize, Sector } from '@prisma/client';

export class SupportOrgProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  customSector?: string;

  @ApiProperty()
  dateEstablished: Date;

  @ApiProperty({ enum: OrgSize })
  organizationSize: OrgSize;

  @ApiProperty({ required: false })
  alternatePhone?: string;

  @ApiProperty({ required: false })
  organizationLogo?: string;

  @ApiProperty({ enum: Sector })
  sectors: Sector[];
}

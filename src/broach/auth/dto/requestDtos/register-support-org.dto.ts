import { ApiProperty } from '@nestjs/swagger';
import { OrgSize } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { Match } from 'src/utils/validators/match.decorator';

/* enum Sector {
  mental_health = 'mental_health',
  legal_assistance = 'legal_assistance',
  gender_based_advocacy = 'gender_based_advocacy',
  human_rights = 'human_rights',
  child_rights = 'child_rights',
  crisis_support = 'crisis_support',
  social_welfare_and_Livelihood_support_services = 'social_welfare_and_Livelihood_support_services',
  health_medical_services = 'health_medical_services',
  community_advocacy = 'community_advocacy ',
  disability_and_inclusion = 'disability_and_inclusion ',
  technology_and_digital_rights = 'technology_and_digital_rights ',
  health_and_rehabilitation_services = 'health_and_rehabilitation_services ',
  others = 'others',
} */

/* enum OrgSize {
  size_5_10 = 'size_5_10',
  size_10_20 = 'size_10_20',
  size_20_50 = 'size_20_50',
  size_50_plus = 'size_50_plus',
} */

export class RegisterSupportOrgDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Helping Hands Initiative',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  organizationName: string;


  @ApiProperty({
    description: 'Email address of the organization'
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email: string;


  @ApiProperty({
    description: 'Phone number of the organization',
    example: '+2348012345678 or 08012345678',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^(?:0\d{10}|\+234\d{10})$/, {
  message: 'Phone must be either local (080XXXXXXXX) or international (+234XXXXXXXXXX)',
  })
  phone: string;


  @ApiProperty({
    description: 'Password for the organization account',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(6)
  password: string;


  @ApiProperty({
    description: 'Confirmation of the password',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
  /* 
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  customSector?: string;

  @IsDateString()
  dateEstablished: string;

  @IsEnum(OrgSize)
  organizationSize: OrgSize;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsPhoneNumber()
  alternatePhone?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  organizationLogo?: string;

  @ApiProperty({ type: [String], description: 'lists of sectors'})
  @IsArray()
  @IsString( { each : true })
  @Transform(({ value }: { value: unknown }) => typeof value == 'string' ? value.trim(): value,)
  sectors: String[];
*/
}


export class CompleteSupportOrgProfileDto {
/*   @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string; */

// Sector Id of the organizations selected.
  @ApiProperty({
    description: 'IDs of the selected sectors',
    example: ['b2f0a4a3-8b10-4d3b-98f1-5df28a3e7e3c'],
    isArray: true,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  })
  @IsUUID('all', { each: true })
  @IsOptional()
  sectorId: string[];


  // date the organization was established
  @ApiProperty({
    description: 'date established of the organization',
    example: '2000-01-01',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsDateString()
  dateEstablished: string;

// size of the organization
  @ApiProperty({
    description: 'size of the organization',
    example: 'size_5_10',
  })
  @IsEnum(OrgSize)
  organizationSize: OrgSize;

// address of the organization
  @ApiProperty({
  description: 'Organization address',
  example: '123 Main St, Lagos, Nigeria',
  })
  @Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  address: string

  // alternate phone number of the organization
  @ApiProperty({
    description: 'Alternate phone number of the organization',
    example: '+2348012345678 or 08012345678',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  alternatePhone: string;


}

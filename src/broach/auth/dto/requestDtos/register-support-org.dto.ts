import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Match } from 'src/utils/validators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Sector } from '@prisma/client';

// enum Sector {
//   mental_health = 'mental_health',
//   legal_assistance = 'legal_assistance',
//   gender_based_advocacy = 'gender_based_advocacy',
//   human_rights = 'human_rights',
//   child_rights = 'child_rights',
//   crisis_support = 'crisis_support',
//   social_welfare_and_Livelihood_support_services = 'social_welfare_and_Livelihood_support_services',
//   health_medical_services = 'health_medical_services',
//   community_advocacy = 'community_advocacy ',
//   disability_and_inclusion = 'disability_and_inclusion ',
//   technology_and_digital_rights = 'technology_and_digital_rights ',
//   health_and_rehabilitation_services = 'health_and_rehabilitation_services ',
//   others = 'others',
// }

enum OrgSize {
  size_5_10 = 'size_5_10',
  size_10_20 = 'size_10_20',
  size_20_50 = 'size_20_50',
  size_50_plus = 'size_50_plus',
}

export class RegisterSupportOrgDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  organizationName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  email: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsPhoneNumber()
  phone: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(6)
  password: string;

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
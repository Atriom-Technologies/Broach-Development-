import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Match } from 'src/utils/validators/match.decorator';

enum Sector {
  mental_health = 'mental_health',
  legal_assistance = 'legal_assistance',
  gender_based_advocacy = 'gender_based_advocacy',
  human_rights = 'human_rights',
  child_rights = 'child_rights',
  others = 'others',
}

enum OrgSize {
  size_5_10 = 'size_5_10',
  size_10_20 = 'size_10_20',
  size_20_50 = 'size_20_50',
  size_50_PLUS = 'size_50_PLUS',
}

export class RegisterSupportOrgDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  fullName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
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

  @IsEnum(Sector)
  sector: Sector;

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
}

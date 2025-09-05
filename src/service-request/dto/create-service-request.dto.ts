import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  WhoIsReporting,
  AgeRange,
  TypeOfService,
  MaritalStatus,
  EmploymentStatus,
  VulnerabilityStatus,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';


class ServiceDetailsDto {
  @ApiProperty({ example: 'TYPE_OF_SERVICE', enum: TypeOfService })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsEnum(TypeOfService)
  typeOfService: TypeOfService;

  @ApiProperty({ example: 'MARITAL_STATUS', enum: MaritalStatus })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @ApiProperty({ example: 'EMPLOYMENT_STATUS', enum: EmploymentStatus })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsEnum(EmploymentStatus)
  workStatus: EmploymentStatus;

  @ApiProperty({ example: 'VULNERABILITY_STATUS', enum: VulnerabilityStatus })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsEnum(VulnerabilityStatus)
  vulnerabilityStatus: VulnerabilityStatus;

  @ApiProperty({ example: 'Detailed description of the service needed' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value,)
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class BioDetailsDto {
  @ApiProperty({ example: 'WHO_IS_REPORTING', enum: WhoIsReporting })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsEnum(WhoIsReporting)
  whoNeedsThisService: WhoIsReporting;

  @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange, required: false })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiProperty({ example: 'Phone number of the person in need', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Email address of the person in need', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Confirmation that the information provided is accurate' })
  @IsBoolean()
  infoConfirmed: boolean;
  

  // we don’t allow client to set caseStatus → defaults to PENDING
  // we don’t allow client to set supportOrgProfileId directly → assigned later

  @ValidateNested()
  @Type(() => ServiceDetailsDto)
  serviceDetails: ServiceDetailsDto;
}

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEmail,
  ValidateNested,
  Equals,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  WhoIsReporting,
  AgeRange,
  MaritalStatus,
  EmploymentStatus,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class ServiceDetailsDto {
  @ApiProperty({ description: 'Type of Service Id' })
  //@Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsString()
  serviceTypeId: string;

  @ApiProperty({ example: 'MARITAL_STATUS', enum: MaritalStatus })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @ApiProperty({ example: 'EMPLOYMENT_STATUS', enum: EmploymentStatus })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(EmploymentStatus)
  workStatus: EmploymentStatus;

  @ApiProperty({ description: 'Vulnerability Status Id' })
  //@Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
  @IsString()
  vulnerabilityStatusId: string;

  @ApiProperty({
    example: 'Brief description of the service to be requested',
    minLength: 10,
    maxLength: 200,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class BioDetailsDto {
  @ApiProperty({ example: 'WHO_IS_REPORTING', enum: WhoIsReporting })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(WhoIsReporting)
  whoNeedsThisService: WhoIsReporting;

  @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange, required: false })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiProperty({
    example: 'Phone number of the person in need',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Email address of the person in need',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Confirmation that the information provided is accurate',
  })
  @IsBoolean()
  @Equals(true, { message: 'Confirm that information submitted is accurate' })
  infoConfirmed: boolean;

  // we don’t allow client to set caseStatus → defaults to PENDING
  // we don’t allow client to set supportOrgProfileId directly → assigned later

  @ValidateNested()
  @Type(() => ServiceDetailsDto)
  serviceDetails: ServiceDetailsDto;
}

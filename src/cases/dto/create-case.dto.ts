import { WhoIsReporting, TypeOfCase, Location, AgeRange, Gender, VulnerabilityStatus, EmploymentStatus, NoOfAssailants } from "@prisma/client";
import { IsEnum, IsBoolean, Length, IsString, IsOptional, ValidateNested, validate, isEAN, isEnum } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";


// DTO for creating a new case

// Victim details
export class VictimDetailsDto {
    @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(AgeRange)
    ageRange: AgeRange;

    @ApiProperty({ example: 'EMPLOYMENT_STATUS', enum: EmploymentStatus })  
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(EmploymentStatus)
    employmentStatus: EmploymentStatus;


    @ApiProperty({ example: 'GENDER', enum: Gender })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: 'VULNERABILITY_STATUS', enum: VulnerabilityStatus })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(VulnerabilityStatus)
    vulnerabilityStatus: VulnerabilityStatus;
}

// Assailant details
export class AssailantDetailsDto {
    @ApiProperty({ example: 'NO_OF_ASSAILANTS', enum: NoOfAssailants })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(NoOfAssailants)
    noOfAssailants: NoOfAssailants;

    @ApiProperty({ example: 'GENDER', enum: Gender })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,)
    @IsEnum(Gender)
    gender: Gender

    @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange })
    @IsEnum(AgeRange)
    ageRange: AgeRange;
}

// Case details
export class CreateCaseDto {
    @ApiProperty({ example: 'WHO_IS_REPORTING', enum: WhoIsReporting })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(WhoIsReporting)
    whoIsReporting: WhoIsReporting;

    @ApiProperty({ example: 'TYPE_OF_CASE', enum: TypeOfCase })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(TypeOfCase)
    typeOfCase: TypeOfCase;

    @ApiProperty({ example: 'LOCATION', enum: Location })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsEnum(Location)
    location: Location;

    @ApiProperty({ example: 'Detailed description of the case', minLength: 10, maxLength: 200 })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
      )
    @IsString()
    @Length(10, 200)
    description: string;

    @ApiProperty({ example: true, description: 'Checkbox to confirm information is accurate' })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
      )
    @IsBoolean()
    infoConfirmed: boolean; // checkbox to confirm information is accurate


    @ApiProperty({ type: VictimDetailsDto, required: false })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsOptional()
    @ValidateNested()
    @Type(() => VictimDetailsDto)
    victimDetails?: VictimDetailsDto;

    @ApiProperty({ type: AssailantDetailsDto, required: false })
    @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
    @IsOptional()
    @ValidateNested()
    @Type(() => AssailantDetailsDto)
    assailantDetails?: AssailantDetailsDto;
}

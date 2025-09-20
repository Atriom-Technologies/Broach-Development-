import { WhoIsReporting, CaseType, Location, AgeRange, Gender, VulnerabilityStatus, EmploymentStatus, NoOfAssailants } from "@prisma/client";
import { IsEnum, IsBoolean, Length, IsString, IsOptional, ValidateNested, validate, isEAN, isEnum, IsArray, Equals } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";


// DTO for creating a new case

// Victim details
export class VictimDetailsDto {
    @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange })
    @IsEnum(AgeRange)
    ageRange: AgeRange;

    @ApiProperty({ example: 'EMPLOYMENT_STATUS', enum: EmploymentStatus })  
    @IsEnum(EmploymentStatus)
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
    employmentStatus: EmploymentStatus;


    @ApiProperty({ example: 'GENDER', enum: Gender })
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ description: 'Vulnerability status ID selected by the user' })
    @IsOptional()
    @IsString()
    vulnerabilityStatusId?: string; // optional

}

// Assailant details
export class AssailantDetailsDto {
    @ApiProperty({ example: 'NO_OF_ASSAILANTS', enum: NoOfAssailants })
    @IsEnum(NoOfAssailants)
    noOfPeople: NoOfAssailants;

    @ApiProperty({ example: 'GENDER', enum: Gender })
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
    @IsEnum(Gender)
    gender: Gender

    @ApiProperty({ example: 'AGE_RANGE', enum: AgeRange })
    @IsEnum(AgeRange)
    ageRange: AgeRange;
}

// Case details
export class CreateCaseDto {
    @ApiProperty({ example: 'WHO_IS_REPORTING', enum: WhoIsReporting })
    @IsEnum(WhoIsReporting)
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
    whoIsReporting: WhoIsReporting;

    @ApiProperty({description: 'Case satus id selected by user'})
    @IsString()
    typeOfAssaultId: string;

    @ApiProperty({ example: 'LOCATION', enum: Location })
    @IsEnum(Location)
    @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value,)
    location?: Location;

    @ApiProperty({ example: 'Brief description of the case', minLength: 10, maxLength: 200 })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
      )
    @IsString()
    @Length(10, 200)
    description: string;

    @ApiProperty({ example: true, description: 'Confirm information is accurate' })
    @IsBoolean()
    @Equals(true, { message: 'You must confirm information as accurate' })
    infoConfirmed: boolean; // checkbox to confirm information is accurate


    @ApiProperty({ type: VictimDetailsDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => VictimDetailsDto)
    victimDetails?: VictimDetailsDto;

    @ApiProperty({ type: AssailantDetailsDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AssailantDetailsDto)
    assailantDetails: AssailantDetailsDto;
}

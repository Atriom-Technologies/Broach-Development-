import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';
/* import { ApiPropertyOptional } from '@nestjs/swagger';
import { Equals, IsBoolean, IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Location, WhoIsReporting } from '@prisma/client'; */

export class UpdateCaseDto extends PartialType(CreateCaseDto) {}

/*     @ApiPropertyOptional({ enum: WhoIsReporting })
    @IsOptional()
    @IsEnum(WhoIsReporting)
    whoIsReporting?: WhoIsReporting;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    typeOfAssaultId?: string;

    @ApiPropertyOptional({ enum: Location,  required: false })
    @IsOptional()
    @IsEnum(Location)
    location?: Location;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(10, 200)
    description?: string;

    // @ApiPropertyOptional()
    // @IsOptional()
    // @IsBoolean()
    // @Equals(true, { message: 'You must confirm information as accurate' })
    // infoConfirmed?: boolean;


    @ApiPropertyOptional({ type: VictimDetailsDto })
    @ValidateNested()
    @Type(() => VictimDetailsDto)
    @IsOptional()
    victimDetails?: VictimDetailsDto;

    @ApiPropertyOptional({ type: AssailantDetailsDto })
    @ValidateNested()
    @Type(() => AssailantDetailsDto)
    @IsOptional()
    assailantDetails?: AssailantDetailsDto; */

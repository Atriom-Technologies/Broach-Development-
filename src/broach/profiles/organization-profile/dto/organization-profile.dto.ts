import { ApiProperty } from '@nestjs/swagger';
import { OrgSize } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class OrganizationProfileDto {

  @ApiProperty({ required: false })
  @IsOptional()
  customSector?: string;  

  @ApiProperty({
    description: 'Date of Organization Established', 
    example: '1990-01-01'})
  @IsDateString()
  @IsOptional()
  dateEstablished?: string;

  @ApiProperty({ enum: OrgSize })
  @IsEnum(OrgSize)
  organizationSize?: OrgSize;

  @ApiProperty({ required: false })
  @Transform(({value} : { value: string }) => typeof value === 'string'? value.trim(): value)
  @IsString()
  alternatePhone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  organizationLogo?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: string }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'List of Organization sector IDs', 
    type: [String], 
    example: ['sectorId1', 'sectorId2'] })
  @IsArray()
  @IsString({ each: true })
  sectors: string[];
}

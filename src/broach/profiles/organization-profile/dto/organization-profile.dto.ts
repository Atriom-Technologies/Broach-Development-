import { ApiProperty, PickType } from '@nestjs/swagger';
import { OrgSize } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class OrganizationProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  customSector?: string;

  @ApiProperty({
    description: 'Date of Organization Established',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  dateEstablished?: string;

  @ApiProperty({ enum: OrgSize })
  @IsEnum(OrgSize)
  organizationSize?: OrgSize;

  @ApiProperty({ required: false })
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  organizationLogoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'List of Organization sector IDs',
    type: [String],
    example: ['sectorId1', 'sectorId2'],
  })
  @IsArray()
  @IsString({ each: true })
  sectors: string[];
}




export class EditOrganizationProfileDto extends PickType(OrganizationProfileDto, ['dateEstablished', 'address', 'sectors'] as const) {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',})
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',})
  @Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({
    description: " Sector ID(s)",
    isArray: true,
    type: String
  })
  @IsOptional()
  @IsUUID('all', { each: true })
  sectors: string[];


}

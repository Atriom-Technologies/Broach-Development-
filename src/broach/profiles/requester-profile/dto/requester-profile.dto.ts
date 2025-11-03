import { ApiProperty, PickType } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class RequesterProfileDto {
  @ApiProperty({
    description: 'Gender of the user',
    example: 'male',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth of the user',
    example: '1987-05-10', 
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Occupation of the user',
    example: 'Engineer',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsOptional()
  occupation: string;

  @ApiProperty({description: 'Covert or URL'})
  @IsOptional()
  coverPhotoUrl?: string

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  profilePicture?: string;
}


export class EditRequesterProfileDto extends PickType(RequesterProfileDto, ['occupation', 'dateOfBirth',] as const) {
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',})
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Location of the user',
    example: 'New York, USA',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',})
  @Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  fullName?: string;
}
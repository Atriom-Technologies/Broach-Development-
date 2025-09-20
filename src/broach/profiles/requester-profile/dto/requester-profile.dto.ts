import { ApiProperty } from '@nestjs/swagger';
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
    example: '1990-01-01',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Occupation of the user',
    example: 'Engineer',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  occupation: string;


@ApiProperty({ type: 'string', format: 'binary', required: false })
@IsOptional()
profilePicture?: any;


}

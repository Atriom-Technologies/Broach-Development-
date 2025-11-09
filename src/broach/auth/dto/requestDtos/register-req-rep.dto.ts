import { Transform } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsDateString,
  IsEnum,
  MinLength,
  IsOptional,
  Matches,
  IsUUID,
} from 'class-validator';
import { Match } from 'src/utils/validators/match.decorator';
import { Gender } from '@prisma/client';

export class RegisterReqRepDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jesse Pinkman',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'abcdew@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+2348012345678 or 08012345678',
  }) 
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^(?:0\d{10}|\+234\d{10})$/, {
    message: 'Phone must be either local (080XXXXXXXX) or international (+234XXXXXXXXXX)',
  })
  phone: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Confirmation of the password',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Match('password', { message: 'Password do not match' })
  confirmPassword: string;
}


export class RequesterCompleteProfileDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;


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

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }: { value: string }) =>
      typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    location?: string;

  // @ApiProperty({description: 'Covert or URL'})
  // @IsOptional()
  // coverPhotoUrl?: string

  // @ApiProperty({ type: 'string', format: 'binary', required: false })
  // @IsOptional()
  // profilePicture?: string;
}

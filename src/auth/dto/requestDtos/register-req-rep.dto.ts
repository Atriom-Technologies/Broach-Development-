import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  Matches
} from 'class-validator';
import { Match } from 'src/utils/validators/match.decorator';

enum Gender {
  male = 'male',
  female = 'female',
}

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
    example: '+2348012345678',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\+?[1-9]\d{7,14}$/, {
  message: 'phone must be in format +2348012345678',
})
  @IsPhoneNumber()
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


  @ApiProperty({
    description: 'Profile picture URL of the user',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  profilePicture?: string;
}

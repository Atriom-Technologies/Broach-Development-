import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength  } from 'class-validator';
import { string } from 'joi';
import { Match } from 'src/utils/validators/match.decorator';

export class ForgotPassword {

  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@gmail.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value == 'string' ? value?.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;
}

export class ResetPassword {

  @ApiProperty({
    description: 'Token for reset password',
  })
  @Transform(({ value }: {value: unknown}) => typeof value == 'string'? value.trim(): value)
  @IsString()
  token: string;



  @ApiProperty({
    description: 'New Password for the user account',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(6)
  newPassword: string;


}
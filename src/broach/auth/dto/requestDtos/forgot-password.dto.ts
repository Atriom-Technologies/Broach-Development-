import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, minLength, MinLength } from 'class-validator';

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
  @Transform(({ value }: { value: unknown }) =>
    typeof value == 'string' ? value.trim() : value,
  )
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New Password for the user account',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(4)
  newPassword: string;

  @ApiProperty({
    description: 'confirm new password',
    example: 'newpassword'
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MinLength(4)
  confirmPassword: string
}

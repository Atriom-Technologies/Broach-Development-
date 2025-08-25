import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {

  @ApiProperty({
    description: 'Email address of the user',
    example: 'example@gmail.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value == 'string' ? value?.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;


  @ApiProperty({
    description: 'Password for the user account',
    example: 'strongPassword123',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value == 'string' ? value?.trim() : value,
  )
  @IsString()
  @MinLength(6)
  password: string;
}

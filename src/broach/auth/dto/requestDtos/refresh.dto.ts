import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token', example: 'some-refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RefreshTokenDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  refreshToken: string;
}

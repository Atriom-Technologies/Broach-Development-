import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    description: 'The ID of the last item from the previous batch. Leave empty for the first page.',
    example: '6f9b8c2a-1234-5678-abcd-ef0123456789',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ description: 'Number of items per page', example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}

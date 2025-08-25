import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class RequesterReporterProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty()
  occupation: string;

  @ApiProperty({ required: false })
  profilePicture?: string;
}

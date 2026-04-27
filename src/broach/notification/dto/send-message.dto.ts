import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { NotificationOwnerType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500) // Matches your Prisma @db.VarChar(500)
  content!: string;

  @IsEnum(NotificationOwnerType)
  senderType!: NotificationOwnerType;
}

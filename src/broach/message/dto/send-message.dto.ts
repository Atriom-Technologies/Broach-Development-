import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500) // matches Message.content @db.VarChar(500)
  content!: string;
}

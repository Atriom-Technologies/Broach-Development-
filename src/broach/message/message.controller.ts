import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':chatRoomId')
  getMessages(
    @Param('chatRoomId') chatRoomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.messageService.getMessages({
      chatRoomId,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }
}

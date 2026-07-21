import { Controller, Get, Post, Param, Query, Body, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/interfaces/jwt-payload.interface';
import { UserFromJwt } from '../auth/interfaces/jwt-payload.interface';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('message')
@UseGuards(JwtAuthGuard) // every route here requires a valid, authenticated session
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':chatRoomId')
  async getMessages(
    @Param('chatRoomId') chatRoomId: string,
    @CurrentUser() user: UserFromJwt,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const hasAccess = await this.messageService.validateRoomAccess(chatRoomId, user.id);
    if (!hasAccess) throw new ForbiddenException('You are not a participant of this chat room.');

    return this.messageService.getMessages({
      chatRoomId,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post(':chatRoomId')
  sendMessage(@Param('chatRoomId') chatRoomId: string, @CurrentUser() user: UserFromJwt, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage({
      chatRoomId,
      senderId: user.id, // NEVER trust a client-supplied senderId — always the JWT's own id
      content: dto.content,
    });
  }
}

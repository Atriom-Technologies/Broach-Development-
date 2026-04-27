import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RequestWithUserPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationOwnerType } from '@prisma/client';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Controller method to get notifications for the authenticated user
  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: RequestWithUserPayload) {
    const userId = req.user.id;
    const result = await this.notificationService.getUserNotifications(userId);
    return result;
  }

  // Controller method to contact reporter
  @Post(':id/contact')
  @UseGuards(JwtAuthGuard)
  contactReporter(
    @Param('id') notificationId: string,
    @Req() req: RequestWithUserPayload,
  ) {
    return this.notificationService.contactReporter(
      notificationId,
      req.user.id,
    );
  }

  // Controller method to respond to conversation
  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  respond(
    @Param('id') notificationId: string,
    @Req() req: RequestWithUserPayload,
  ) {
    return this.notificationService.respondToConversation(
      notificationId,
      req.user.id,
    );
  }

  // Controller method to end conversation
  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  endConversation(@Param('id') notificationId: string, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.endConversation(notificationId, userId);
  }

  // // Controller method to get chat history for a specific chat room
  // @Get('chat/:chatRoomId/messages')
  // @UseGuards(JwtAuthGuard)
  // async getMessages(@Param('chatRoomId') chatRoomId: string) {
  //   return this.notificationService.getChatHistory(chatRoomId);
  // }

  // @Post('chat/:chatRoomId/send')
  // @UseGuards(JwtAuthGuard)
  // async postMessage(
  //   @Param('chatRoomId') chatRoomId: string,
  //   @Req() req: RequestWithUserPayload,
  //   @Body() dto: SendMessageDto, // Use the DTO here
  // ) {
  //   return this.notificationService.sendMessage(
  //     chatRoomId,
  //     req.user.id,
  //     dto.senderType,
  //     dto.content,
  //   );
  // }
}

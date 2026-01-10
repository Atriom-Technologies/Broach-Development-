import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RequestWithUserPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}

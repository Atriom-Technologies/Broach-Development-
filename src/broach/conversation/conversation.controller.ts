import { Controller, Post, Get, Param, UseGuards, ForbiddenException, HttpStatus, HttpCode } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CasesService } from '../cases/cases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from '../auth/interfaces/jwt-payload.interface';
import { UserFromJwt } from '../auth/interfaces/jwt-payload.interface';
import { UserType, NotificationSourceType } from '@prisma/client';

@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly casesService: CasesService,
  ) {}

  // Org hits "Contact Reporter" — creates the room if it doesn't exist yet, or returns the existing one ("Resume")
  @Post('case/:caseId/contact-reporter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.support_organization)
  async contactReporter(@Param('caseId') caseId: string, @CurrentUser() user: UserFromJwt) {
    const { assignment, reporterUserId, organizationUserId } = await this.casesService.getContactContext(
      caseId,
      user.id,
    );

    if (assignment.status !== 'in_discussion') {
      throw new ForbiddenException('You can only contact the reporter for a case you currently hold.');
    }

    return this.conversationService.getOrCreateChatRoom({
      sourceType: NotificationSourceType.CASE_REPORT,
      sourceId: assignment.id,
      reporterUserId,
      organizationUserId,
    });
  }

  // Reporter hits "Respond"/"Resume" — fetch only, never creates
  @Get('case/:caseId/room')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.requester_reporter)
  async getRoomForCase(@Param('caseId') caseId: string, @CurrentUser() user: UserFromJwt) {
    const assignmentId = await this.casesService.getActiveAssignmentIdForReporter(caseId, user.id);
    return this.conversationService.getRoomBySource(NotificationSourceType.CASE_REPORT, assignmentId);
  }

  @Post(':chatRoomId/end')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  endConversation(@Param('chatRoomId') chatRoomId: string, @CurrentUser() user: UserFromJwt) {
    return this.conversationService.endConversation(chatRoomId, user.id);
  }
}

import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { EngagementType, NotificationStatus, Prisma, PrismaClient } from '@prisma/client';
import { NotificationResponseDto } from './dto/notificaton-response.dto';
import { NotificationActionDto } from './dto/notification.dto';


@Injectable()
export class NotificationService{
    private readonly logger = new Logger(NotificationService.name);
    constructor(private readonly prisma: PrismaService){}

    /**
        * Create notifications for all org users.
        *
        * @param opts.senderId  - user who created the case/service
        * @param opts.relatedId - caseId or serviceRequestId
        * @param opts.type      - EngagementType (CASE_REPORT | SERVICE_REQUEST)
        * @param tx            - optional Prisma transaction client (use when inside a transaction)
    */

    async createNotificationForAllOrgs(
        opts: {
            senderId: string;
            relatedId: string;
            type: EngagementType;
            message?: string;
            assignmentId?: string|null;
            status: NotificationStatus;
        },
        tx?: Prisma.TransactionClient,
    ) {
        const prismaClient: Prisma.TransactionClient | PrismaClient =
        tx ?? (this.prisma as unknown as PrismaClient)

        // Fetch all organizations
        const allOrgs = await prismaClient.user.findMany({
            where: {userType: 'support_organization'},
            select : {
                id: true
            }
        });

        if(!allOrgs?.length) {
            this.logger.warn('No support organization found to notify.')
            return 0;
        }

        // Prepare notification payload
        const payload: Prisma.NotificationCreateManyInput[] = allOrgs.map((org) => ({
            id: createId(),
            type: opts.type,
            relatedId: opts.relatedId,
            senderId: opts.senderId,
            receiverId: org.id,
            message: opts.message ?? `${ opts.type === "CASE_REPORT" ? 'New Case Report' : 'New Service Request'} submitted.`,
            assignmentId: opts.assignmentId ?? null,
            status: opts.status,
        }));


            // create in chunks to avoid too-large single query (tune chunk size as needed)
 /*        const chunkSize = 500; // safe default
        for (let i = 0; i < payload.length; i += chunkSize) {
            const chunk = payload.slice(i, i + chunkSize);
            // Create the notification */
            await prismaClient.notification.createMany({
                data: payload,
                skipDuplicates: true,
            });
        this.logger.log(`Created ${payload.length} notifications for all  organization`)
        return payload.length;
    }
}

//     // Get all notifications for a user (org or reporter)
//     async getNotificationsForUser(userId: string, status?: string): Promise<NotificationResponseDto[]> {
//         const whereClause: any = {
//         OR: [
//             { receiverId: userId },
//             { senderId: userId }
//         ]
//         };
//         if (status) whereClause.status = status;

//         const notifications = await this.prisma.notification.findMany({
//         where: whereClause,
//         include: {
//             sender: { include: { requesterReporterProfile: true } },
//             assignment: true
//         },
//         orderBy: { createdAt: 'desc' }
//         });

//         return notifications.map(n => this.buildPayload(n, userId));
//     }

//     // Handle CTA actions
//     async handleAction(notificationId: string, userId: string, dto: NotificationActionDto) {
//         const notification = await this.prisma.notification.findUnique({
//         where: { id: notificationId },
//         include: { sender: true, receiver: true, assignment: true }
//         });

//         if (!notification) throw new NotFoundException('Notification not found');

//         const isOrg = notification.receiverId === userId;
//         const isReporter = notification.senderId === userId;

//         if (!isOrg && !isReporter) throw new ForbiddenException('Not allowed to act on this notification');

//         // Determine new status & mirrored logic
//         const { newStatus, mirroredAction } = this.getStatusTransition(notification.status, dto.action, isOrg);

//         // Update notification
//         const updatedNotification = await this.prisma.notification.update({
//         where: { id: notificationId },
//         data: { status: newStatus }
//         });

//         // If mirrored action needed, update corresponding notification for other side
//         if (mirroredAction) {
//         await this.prisma.notification.updateMany({
//             where: { relatedId: notification.relatedId, receiverId: isOrg ? notification.senderId : notification.receiverId },
//             data: { status: newStatus }
//         });
//         }

//         return this.buildPayload(updatedNotification, userId);
//     }

//     // Map status transitions based on action + role
//     private getStatusTransition(currentStatus: string, action: string, isOrg: boolean) {
//         let newStatus = currentStatus;
//         let mirroredAction = false;

//         switch (currentStatus) {
//         case 'pending':
//             if (isOrg) {
//             if (action === 'contact') { newStatus = 'in_discussion'; mirroredAction = true; }
//             else if (action === 'cancel') newStatus = 'closed';
//             } else {
//             if (action === 'respond') { newStatus = 'in_discussion'; mirroredAction = true; }
//             }
//             break;
//         case 'in_discussion':
//             if (action === 'end') newStatus = 'closed';
//             break;
//         case 'closed':
//             if (action === 'remove') newStatus = 'closed';
//             break;
//         }

//         return { newStatus, mirroredAction };
//     }

//     // Build frontend-ready payload
//     private buildPayload(notification: any, currentUserId: string): NotificationResponseDto {
//         const isOrg = notification.receiverId === currentUserId;
//         let primary = '';
//         let secondary: string | undefined = undefined;

//         switch (notification.status) {
//         case 'pending':
//             if (isOrg) { primary = 'Contact Reporter'; secondary = 'Cancel'; }
//             else { primary = 'Respond'; secondary = 'Cancel'; }
//             break;
//         case 'in_discussion':
//             primary = 'Resume';
//             secondary = 'End';
//             break;
//         case 'closed':
//             primary = 'Remove';
//             break;
//         }

//         return {
//         id: notification.id,
//         type: notification.type,
//         status: notification.status,
//         createdAt: notification.createdAt,
//         updatedAt: notification.updatedAt,
//         report: {
//             id: notification.relatedId,
//             title: notification.type === 'CASE_REPORT' ? 'Case Report' : 'Service Request',
//             description: notification.message || '',
//             caseType: notification.type === 'CASE_REPORT' ? 'Abuse' : undefined,
//             serviceType: notification.type === 'SERVICE_REQUEST' ? 'Counselling' : undefined,
//             reporter: {
//             id: notification.sender.id,
//             fullName: notification.sender.requesterReporterProfile?.fullName || 'Unknown',
//             profilePicture: notification.sender.requesterReporterProfile?.profilePicture
//             }
//         },
//         ctas: { primary, secondary }
//         };
//     }

// }
  




import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { EngagementType, NotificationStatus, Prisma, PrismaClient } from '@prisma/client';


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

// @Injectable()
// export class NotificationService {

//     constructor(
//     private readonly prisma: PrismaService,
//     private readonly logger: AppLogger,
//     ){}


//         /**
//      * Create multiple notifications at once (for all organizations, for example).
//      */
//     async createMany<T>(payloads: NotificationPayload<T>[]) {
//         if (!payloads.length) return;

//         await this.prisma.notification.createMany({
//         data: payloads.map((p) => ({
//             userId: p.userId,
//             title: p.title,
//             message: p.message,
//             type: p.type,
//             metadata: p.metadata,
//         })),
//         });

//         this.logger.log(`✅ Created ${payloads.length} notifications`);
//     }

//     /**
//     * Create a single notification record in the database.
//     */
//     async create<T>(payload: NotificationPayload<T>) {
//         const { userId, title, message, type, metadata } = payload;

//         return this.prisma.notification.create({
//         data: {
//             userId,
//             title,
//             message,
//             type,
//             metadata,
//         },
//         });
//     }
// }





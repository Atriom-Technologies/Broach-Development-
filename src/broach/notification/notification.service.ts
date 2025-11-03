// import { Injectable } from '@nestjs/common';
// import { AppLogger } from 'src/logger/logger.service';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { NotificationPayload } from './notification.types';

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





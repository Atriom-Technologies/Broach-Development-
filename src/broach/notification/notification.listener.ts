// // src/modules/notification/notification.listener.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { NotificationService } from './notification.service';
// import { OnEvent } from '@nestjs/event-emitter';
// import { NotificationFactory } from './notification.factory';
// import { CaseDetails } from '@prisma/client';

// @Injectable()
// export class NotificationListener {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly notificationService: NotificationService,
//   ) {}

//   /**
//    * Fires when a new case is created.
//    * Notifies all organizations in the system.
//    */
//   @OnEvent('case.created', { async: true })
//   async handleCaseCreated(payload: { caseDetails: CaseDetails }) {
//     const { caseDetails } = payload;
//     // Build metadata
//     const metadata = {
//       caseId: caseDetails.id,
//       reporter: caseDetails.
//       caseType: caseDetails.
//     };

//     // Fetch all organizations
//     const orgs = await this.prisma.supportOrgProfile.findMany({
//       select: { userId: true },
//     });

//     // Create notifications for each org
//     const notifications = orgs.map((org) =>
//       NotificationFactory.build('case.created', org.userId, metadata),
//     );

//     // Save all notifications
//     await this.notificationService.createMany(notifications);
//   }
// }

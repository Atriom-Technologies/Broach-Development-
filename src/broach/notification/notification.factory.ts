// import { NotificationType } from '@prisma/client';
// import { NotificationPayload } from './notification.types';
// import { NotificationStatus } from '@prisma/client';

// export class NotificationFactory {
//     /**
//      * This budilds a typed notification payload for an event
//      * Keeps title and message consistent across the application
//      */
//     static build<T extends Record<string, unknown>>(
//         event: 
//         |'case.created'
//         | 'service.requested'
//         | 'org.contact_reporter'
//         | 'requester_reporter.respond'
//         | 'conversation.ended',
//         userId: string,
//         metadata?: T,
//     ): NotificationPayload<T> {
//         switch (event) {
//             // Event when a new case is created
//             /**
//             * When a case is first created:
//             * Org gets "contact_reporter", "cancel"
//             * Reporter gets "respond", "cancel"
//             */
//             case 'case.created': {
//                 const reporter = metadata?.['reporter']?? 'Unknown Reporter';
//                 const caseType = metadata?.['caseType'] ?? 'Unknown Case Type';

//                 // For organization
//                 const isOrg = metadata?.['isOrganization'] === true;
//                 const ctas = isOrg
//                     ? ['contact_reporter', 'cancel']: ['respond', 'cancel'];
//                 return {
//                  userId,
//                  title: `Case report with: ${reporter}`,
//                  message: `${caseType}`, // The main notification message that represents the case type just for notification display like in the UX
//                  type: NotificationType.case_created,
//                  status: NotificationStatus.PENDING,
//                  ctas,
//                  metadata,   
//                 }
//             }

//             // Event when a service is requested
//             case 'service.requested': {
//                 const reporter = metadata?.['reporter']?? 'Unknown Reporter';
//                 const serviceType = metadata?.['serviceType'] ?? 'Unknown Service Type';

//                 // For organization
//                 const isReporter = metadata?.['isSupporter'] === true;
//                 const ctas = isReporter
//                     ? ['respond', 'cancel']: ['respond', 'cancel'];
//                 return {
//                     userId,
//                     title: `Service request from: ${reporter}`,
//                     message: `${serviceType}`, // The main notification message that represents the service type just for notification display like in the UX
//                     type: NotificationType.service_requested,
//                     status: NotificationStatus.PENDING,
//                     ctas,
//                     metadata,
//                 }
//             }

//             case 'org.contact_reporter': {
//                 const org = metadata?.['organization'] ?? 'An organization';
//                 const caseType = metadata?.['caseType'] ?? 'case';
//                 return {
//                 userId,
//                 title: `New interest in your ${caseType} report`,
//                 message: `${org} wants to discuss your ${caseType} case.`,
//                 type: NotificationType.ORG_CONTACT_REPORTER,
//                 metadata,
//                 status: NotificationStatus.PENDING,
//                 ctas: ['respond', 'cancel'],
//                 };
//             }

//             case 'requester_reporter.respond': {
//                 const reporter = metadata?.['reporter'] ?? 'Reporter';
//                 return {
//                 userId,
//                 title: `Reporter responded`,
//                 message: `${reporter} has responded to your inquiry.`,
//                 type: NotificationType.REPORTER_RESPOND,
//                 metadata,
//                 status: NotificationStatus.IN_DISC,
//                 ctas: ['resume', 'end'],
//                 };
//             }

//             case 'conversation.ended': {
//                 return {
//                 userId,
//                 title: `Conversation ended`,
//                 message: `This case discussion has been closed.`,
//                 type: NotificationType.REPORTER_RESPOND,
//                 metadata,
//                 status: NotificationStatus.CLOSED,
//                 ctas: ['removefromlist'],
//                 };
//             }

//             default:
//                 throw new Error(`Unknown notification event: ${event}`);
//             }
//     }
// }
// import { NoificationType, NotificationStatus } from '@prisma/client';


// /**
//  * Generic, type-safe notification payload structure
//  * The metadata field is optional and can hold any additional information relevant to the notification
//  */
// export interface NotificationPayload<T = Record<string,unknown>> {
//     userId: string; // Recipient user ID
//     title: string; // A short notification title
//     status: NotificationStatus; // Status of the notification like pending, in_discussion, closed
//     ctas?: string[]; // Call to actions associated with the notification
//     message: string; // The main notification message that represents the case type just for notification display like in the UX
//     metadata?: T; //Additional data or contextual data related to the notification
//     type: NoificationType; // TYpe of notification of enum identifier for notification category or types
// }
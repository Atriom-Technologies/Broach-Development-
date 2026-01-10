/*
  Warnings:

  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatRoom" DROP CONSTRAINT "ChatRoom_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropTable
DROP TABLE "public"."Assignment";

-- DropTable
DROP TABLE "public"."ChatRoom";

-- DropTable
DROP TABLE "public"."Notification";

-- DropEnum
DROP TYPE "public"."AssignmentStatus";

-- DropEnum
DROP TYPE "public"."EngagementType";

-- DropEnum
DROP TYPE "public"."NotificationCounterpartyType";

-- DropEnum
DROP TYPE "public"."NotificationRecipientType";

-- DropEnum
DROP TYPE "public"."NotificationStatus";

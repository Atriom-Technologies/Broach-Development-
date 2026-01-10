/*
  Warnings:

  - The `status` column on the `Assignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[relatedId,type,organizationId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationRecipientType" AS ENUM ('ORGANIZATION', 'REQUESTER');

-- CreateEnum
CREATE TYPE "public"."NotificationCounterpartyType" AS ENUM ('ORGANIZATION', 'REQUESTER');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('active', 'closed');

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_senderId_fkey";

-- DropIndex
DROP INDEX "public"."Assignment_id_idx";

-- DropIndex
DROP INDEX "public"."Notification_id_idx";

-- DropIndex
DROP INDEX "public"."Notification_receiverId_idx";

-- DropIndex
DROP INDEX "public"."Notification_relatedId_idx";

-- DropIndex
DROP INDEX "public"."Notification_senderId_idx";

-- DropIndex
DROP INDEX "public"."Notification_type_idx";

-- AlterTable
ALTER TABLE "public"."Assignment" DROP COLUMN "status",
ADD COLUMN     "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "message",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "autoDeleteAt" TIMESTAMP(3),
ADD COLUMN     "chatRoomId" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "counterpartId" TEXT,
ADD COLUMN     "counterpartType" "public"."NotificationCounterpartyType",
ADD COLUMN     "recipientId" TEXT,
ADD COLUMN     "recipientType" "public"."NotificationRecipientType";

-- CreateTable
CREATE TABLE "public"."ChatRoom" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_assignmentId_key" ON "public"."ChatRoom"("assignmentId");

-- CreateIndex
CREATE INDEX "Assignment_relatedId_type_organizationId_idx" ON "public"."Assignment"("relatedId", "type", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_relatedId_type_organizationId_key" ON "public"."Assignment"("relatedId", "type", "organizationId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_recipientType_idx" ON "public"."Notification"("recipientId", "recipientType");

-- CreateIndex
CREATE INDEX "Notification_relatedId_type_idx" ON "public"."Notification"("relatedId", "type");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "public"."Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_autoDeleteAt_idx" ON "public"."Notification"("autoDeleteAt");

-- CreateIndex
CREATE INDEX "Notification_counterpartId_counterpartType_idx" ON "public"."Notification"("counterpartId", "counterpartType");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

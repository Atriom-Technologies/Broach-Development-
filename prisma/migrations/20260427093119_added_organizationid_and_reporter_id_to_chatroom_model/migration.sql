/*
  Warnings:

  - You are about to drop the column `orgJoined` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `reporterJoined` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sourceType,sourceId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatRoomId,id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `senderRole` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ChatRoomStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- DropIndex
DROP INDEX "public"."Message_chatRoomId_idx";

-- AlterTable
ALTER TABLE "public"."ChatRoom" DROP COLUMN "orgJoined",
DROP COLUMN "reporterJoined",
ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT 'temporary-id',
ADD COLUMN     "reporterId" TEXT NOT NULL DEFAULT 'temporary-id',
ADD COLUMN     "status" "public"."ChatRoomStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "senderType",
ADD COLUMN     "senderRole" "public"."NotificationOwnerType" NOT NULL;

-- CreateTable
CREATE TABLE "public"."ChatParticipant" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."NotificationOwnerType" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatParticipant_chatRoomId_idx" ON "public"."ChatParticipant"("chatRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_chatRoomId_userId_key" ON "public"."ChatParticipant"("chatRoomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_sourceType_sourceId_key" ON "public"."ChatRoom"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_chatRoomId_createdAt_idx" ON "public"."Message"("chatRoomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_chatRoomId_id_key" ON "public"."Message"("chatRoomId", "id");

-- CreateIndex
CREATE INDEX "Notification_ownerType_ownerId_idx" ON "public"."Notification"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Notification_sourceType_sourceId_idx" ON "public"."Notification"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_ownerId_idx" ON "public"."Notification"("ownerId");

-- AddForeignKey
ALTER TABLE "public"."ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

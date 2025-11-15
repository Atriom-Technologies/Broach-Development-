-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."Assignment" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "reporterId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "receiverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."NotificationOwnerType" AS ENUM ('ORGANIZATION', 'REPORTER');

-- CreateEnum
CREATE TYPE "public"."NotificationSourceType" AS ENUM ('CASE_REPORT', 'SERVICE_REQUEST');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'IN_DISCUSSION', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "ownerType" "public"."NotificationOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sourceType" "public"."NotificationSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

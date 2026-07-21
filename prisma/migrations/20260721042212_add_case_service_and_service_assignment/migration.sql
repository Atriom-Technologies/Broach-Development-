/*
  Warnings:

  - You are about to drop the column `organizationId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `reporterId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `caseStatus` on the `ServiceRequests` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'in_discussion', 'resolved', 'rejected', 'withdrawn');

-- AlterEnum
ALTER TYPE "CaseStatus" ADD VALUE 'withdrawn';

-- DropIndex
DROP INDEX "CaseDetails_createdAt_idx";

-- DropIndex
DROP INDEX "CaseDetails_deletedAt_idx";

-- DropIndex
DROP INDEX "CaseDetails_id_idx";

-- DropIndex
DROP INDEX "Message_chatRoomId_id_key";

-- DropIndex
DROP INDEX "RequesterReporterProfile_id_idx";

-- DropIndex
DROP INDEX "RequesterReporterProfile_userId_idx";

-- DropIndex
DROP INDEX "ServiceRequests_caseStatus_idx";

-- DropIndex
DROP INDEX "ServiceRequests_createdAt_idx";

-- DropIndex
DROP INDEX "ServiceRequests_deletedAt_idx";

-- DropIndex
DROP INDEX "ServiceRequests_id_idx";

-- AlterTable
ALTER TABLE "CaseDetails" ADD COLUMN     "claimedByOrganizationId" TEXT;

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "organizationId",
DROP COLUMN "reporterId";

-- AlterTable
ALTER TABLE "ServiceRequests" DROP COLUMN "caseStatus",
ADD COLUMN     "claimedByOrganizationId" TEXT,
ADD COLUMN     "requestStatus" "CaseStatus" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "ServiceAssignment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAssignment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceAssignment_serviceId_status_idx" ON "ServiceAssignment"("serviceId", "status");

-- CreateIndex
CREATE INDEX "ServiceAssignment_organizationId_idx" ON "ServiceAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceAssignment_status_idx" ON "ServiceAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAssignment_serviceId_organizationId_key" ON "ServiceAssignment"("serviceId", "organizationId");

-- CreateIndex
CREATE INDEX "CaseAssignment_caseId_status_idx" ON "CaseAssignment"("caseId", "status");

-- CreateIndex
CREATE INDEX "CaseAssignment_organizationId_idx" ON "CaseAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "CaseAssignment_status_idx" ON "CaseAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAssignment_caseId_organizationId_key" ON "CaseAssignment"("caseId", "organizationId");

-- CreateIndex
CREATE INDEX "CaseDetails_deletedAt_createdAt_idx" ON "CaseDetails"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ServiceRequests_requestStatus_idx" ON "ServiceRequests"("requestStatus");

-- CreateIndex
CREATE INDEX "ServiceRequests_deletedAt_createdAt_idx" ON "ServiceRequests"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ServiceRequests_claimedByOrganizationId_idx" ON "ServiceRequests"("claimedByOrganizationId");

-- AddForeignKey
ALTER TABLE "CaseDetails" ADD CONSTRAINT "CaseDetails_claimedByOrganizationId_fkey" FOREIGN KEY ("claimedByOrganizationId") REFERENCES "SupportOrgProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequests" ADD CONSTRAINT "ServiceRequests_claimedByOrganizationId_fkey" FOREIGN KEY ("claimedByOrganizationId") REFERENCES "SupportOrgProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "SupportOrgProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "SupportOrgProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

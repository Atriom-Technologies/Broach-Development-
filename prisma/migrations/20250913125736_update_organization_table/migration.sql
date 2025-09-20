/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `RequesterReporterProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `OrganizationName` to the `SupportOrgProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_fullName_idx";

-- AlterTable
ALTER TABLE "public"."RequesterReporterProfile" ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" ADD COLUMN     "OrganizationName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "fullName";

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_fullName_idx" ON "public"."RequesterReporterProfile"("fullName");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_OrganizationName_idx" ON "public"."SupportOrgProfile"("OrganizationName");

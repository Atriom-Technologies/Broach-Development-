/*
  Warnings:

  - You are about to drop the column `OrganizationName` on the `SupportOrgProfile` table. All the data in the column will be lost.
  - Added the required column `organizationName` to the `SupportOrgProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."SupportOrgProfile_OrganizationName_idx";

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" DROP COLUMN "OrganizationName",
ADD COLUMN     "organizationName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SupportOrgProfile_organizationName_idx" ON "public"."SupportOrgProfile"("organizationName");

/*
  Warnings:

  - You are about to drop the column `organizationLogo` on the `SupportOrgProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" DROP COLUMN "organizationLogo",
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "organizationLogoUrl" TEXT;

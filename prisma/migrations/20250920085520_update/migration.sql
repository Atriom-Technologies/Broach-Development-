/*
  Warnings:

  - Made the column `fullName` on table `RequesterReporterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationName` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RequesterReporterProfile" ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "occupation" DROP NOT NULL,
ALTER COLUMN "profilePicture" DROP NOT NULL,
ALTER COLUMN "fullName" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" ALTER COLUMN "dateEstablished" DROP NOT NULL,
ALTER COLUMN "organizationSize" DROP NOT NULL,
ALTER COLUMN "alternatePhone" DROP NOT NULL,
ALTER COLUMN "organizationLogo" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "organizationName" SET NOT NULL;

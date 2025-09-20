/*
  Warnings:

  - Made the column `gender` on table `RequesterReporterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateOfBirth` on table `RequesterReporterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `occupation` on table `RequesterReporterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profilePicture` on table `RequesterReporterProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateEstablished` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationSize` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alternatePhone` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationLogo` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `SupportOrgProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RequesterReporterProfile" ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "dateOfBirth" SET NOT NULL,
ALTER COLUMN "occupation" SET NOT NULL,
ALTER COLUMN "profilePicture" SET NOT NULL,
ALTER COLUMN "fullName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" ALTER COLUMN "dateEstablished" SET NOT NULL,
ALTER COLUMN "organizationSize" SET NOT NULL,
ALTER COLUMN "alternatePhone" SET NOT NULL,
ALTER COLUMN "organizationLogo" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "organizationName" DROP NOT NULL;

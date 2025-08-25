/*
  Warnings:

  - The values [MALE,FEMALE] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - The values [SIZE_5_10,SIZE_10_20,SIZE_20_50,SIZE_50_PLUS] on the enum `OrgSize` will be removed. If these variants are still used in the database, this will fail.
  - The values [MENTAL_HEALTH,LEGAL_ASSISTANCE,GENDER_BASED_ADVOCACY,HUMAN_RIGHTS,CHILD_RIGHTS,OTHERS] on the enum `Sector` will be removed. If these variants are still used in the database, this will fail.
  - The values [REQUESTER_REPORTER,SUPPORT_ORGANIZATION] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('male', 'female');
ALTER TABLE "RequesterReporterProfile" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrgSize_new" AS ENUM ('size_5_10', 'size_10_20', 'size_20_50', 'size_50_PLUS');
ALTER TABLE "SupportOrgProfile" ALTER COLUMN "organizationSize" TYPE "OrgSize_new" USING ("organizationSize"::text::"OrgSize_new");
ALTER TYPE "OrgSize" RENAME TO "OrgSize_old";
ALTER TYPE "OrgSize_new" RENAME TO "OrgSize";
DROP TYPE "OrgSize_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Sector_new" AS ENUM ('mental_health', 'legal_assistance', 'gender_based_advocacy', 'human_rights', 'child_rights', 'others');
ALTER TABLE "SupportOrgProfile" ALTER COLUMN "sector" TYPE "Sector_new" USING ("sector"::text::"Sector_new");
ALTER TYPE "Sector" RENAME TO "Sector_old";
ALTER TYPE "Sector_new" RENAME TO "Sector";
DROP TYPE "Sector_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('requester_reporter', 'support_organization');
ALTER TABLE "User" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
COMMIT;

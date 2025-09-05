/*
  Warnings:

  - The values [size_50_PLUS] on the enum `OrgSize` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."WhoIsReporting" AS ENUM ('self', 'parent_guardian', 'spouse', 'witness', 'others');

-- CreateEnum
CREATE TYPE "public"."TypeOfCase" AS ENUM ('sexual_assault', 'physical_assault', 'psychological_emotional_abuse', 'female_genital_mutilation', 'child_abuse', 'forced_marriage', 'online_cyberspace', 'property_dispute', 'others');

-- CreateEnum
CREATE TYPE "public"."Location" AS ENUM ('victim_home', 'perpetrator_home', 'neutral_location', 'school', 'workspace', 'online', 'others');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('PENDING', 'IN_DISC', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."AgeRange" AS ENUM ('less_than_18', 'from_18_to_25', 'from_26_to_35', 'from_36_to_45', 'above_45');

-- CreateEnum
CREATE TYPE "public"."VulnerabilityStatus" AS ENUM ('not_applicable', 'mentally_disabled', 'physically_disabled', 'HIV_positive', 'internally_displaced', 'widow_widower', 'minor_orphan');

-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('employed', 'unemployed', 'self_employed');

-- CreateEnum
CREATE TYPE "public"."NoOfAssailants" AS ENUM ('less_than_2', 'from_2_5', 'from_5_10', 'over_10');

-- AlterEnum
ALTER TYPE "public"."Gender" ADD VALUE 'mixed';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrgSize_new" AS ENUM ('size_5_10', 'size_10_20', 'size_20_50', 'size_50_plus');
ALTER TABLE "public"."SupportOrgProfile" ALTER COLUMN "organizationSize" TYPE "public"."OrgSize_new" USING ("organizationSize"::text::"public"."OrgSize_new");
ALTER TYPE "public"."OrgSize" RENAME TO "OrgSize_old";
ALTER TYPE "public"."OrgSize_new" RENAME TO "OrgSize";
DROP TYPE "public"."OrgSize_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."CaseDetails" (
    "id" TEXT NOT NULL,
    "requesterReporterProfileId" TEXT NOT NULL,
    "whoIsReporting" "public"."WhoIsReporting" NOT NULL,
    "typeOfCase" "public"."TypeOfCase" NOT NULL,
    "location" "public"."Location" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "infoConfirmed" BOOLEAN NOT NULL,
    "caseStatus" "public"."CaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supportOrgProfileId" TEXT,

    CONSTRAINT "CaseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VictimDetails" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "ageRange" "public"."AgeRange" NOT NULL,
    "employmentStatus" "public"."EmploymentStatus" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "vulnerabilityStatus" "public"."VulnerabilityStatus" NOT NULL,

    CONSTRAINT "VictimDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssailantDetails" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "noOfAssailants" "public"."NoOfAssailants" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "ageRange" "public"."AgeRange" NOT NULL,

    CONSTRAINT "AssailantDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseDetails_requesterReporterProfileId_idx" ON "public"."CaseDetails"("requesterReporterProfileId");

-- CreateIndex
CREATE INDEX "CaseDetails_createdAt_idx" ON "public"."CaseDetails"("createdAt");

-- CreateIndex
CREATE INDEX "CaseDetails_updatedAt_idx" ON "public"."CaseDetails"("updatedAt");

-- CreateIndex
CREATE INDEX "CaseDetails_caseStatus_idx" ON "public"."CaseDetails"("caseStatus");

-- CreateIndex
CREATE INDEX "CaseDetails_typeOfCase_idx" ON "public"."CaseDetails"("typeOfCase");

-- CreateIndex
CREATE INDEX "CaseDetails_location_idx" ON "public"."CaseDetails"("location");

-- CreateIndex
CREATE UNIQUE INDEX "VictimDetails_caseId_key" ON "public"."VictimDetails"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "AssailantDetails_caseId_key" ON "public"."AssailantDetails"("caseId");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_sector_idx" ON "public"."SupportOrgProfile"("sector");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_fullName_idx" ON "public"."SupportOrgProfile"("fullName");

-- AddForeignKey
ALTER TABLE "public"."CaseDetails" ADD CONSTRAINT "CaseDetails_requesterReporterProfileId_fkey" FOREIGN KEY ("requesterReporterProfileId") REFERENCES "public"."RequesterReporterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseDetails" ADD CONSTRAINT "CaseDetails_supportOrgProfileId_fkey" FOREIGN KEY ("supportOrgProfileId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VictimDetails" ADD CONSTRAINT "VictimDetails_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssailantDetails" ADD CONSTRAINT "AssailantDetails_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

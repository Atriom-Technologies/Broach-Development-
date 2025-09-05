-- CreateEnum
CREATE TYPE "public"."TypeOfService" AS ENUM ('mental_health_counsel_therapy', 'social_welfare', 'rehabilitation_services', 'health_medical_services', 'housing_shelter_support', 'legal_assistance', 'domestic_violence_support', 'educational_support', 'disability_support_services', 'refugee_displaced_people_support');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('single', 'married', 'separated', 'divorced');

-- DropForeignKey
ALTER TABLE "public"."CaseDetails" DROP CONSTRAINT "CaseDetails_requesterReporterProfileId_fkey";

-- AlterTable
ALTER TABLE "public"."CaseDetails" ALTER COLUMN "requesterReporterProfileId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."BioDetails" (
    "id" TEXT NOT NULL,
    "requesterReporterProfileId" TEXT,
    "WhoNeedsThisService" "public"."WhoIsReporting" NOT NULL,
    "AgeRange" "public"."AgeRange",
    "Phone" TEXT,
    "Email" TEXT,
    "infoConfirmed" BOOLEAN NOT NULL,
    "caseStatus" "public"."CaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supportOrgProfileId" TEXT,

    CONSTRAINT "BioDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceDetails" (
    "id" TEXT NOT NULL,
    "bioId" TEXT NOT NULL,
    "typeOfService" "public"."TypeOfService" NOT NULL,
    "maritalStatus" "public"."MaritalStatus" NOT NULL,
    "workStatus" "public"."EmploymentStatus" NOT NULL,
    "vulnerabilityStatus" "public"."VulnerabilityStatus" NOT NULL,
    "description" VARCHAR(200) NOT NULL,

    CONSTRAINT "ServiceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BioDetails_Phone_key" ON "public"."BioDetails"("Phone");

-- CreateIndex
CREATE UNIQUE INDEX "BioDetails_Email_key" ON "public"."BioDetails"("Email");

-- CreateIndex
CREATE INDEX "BioDetails_requesterReporterProfileId_idx" ON "public"."BioDetails"("requesterReporterProfileId");

-- CreateIndex
CREATE INDEX "BioDetails_createdAt_idx" ON "public"."BioDetails"("createdAt");

-- CreateIndex
CREATE INDEX "BioDetails_updatedAt_idx" ON "public"."BioDetails"("updatedAt");

-- CreateIndex
CREATE INDEX "BioDetails_caseStatus_idx" ON "public"."BioDetails"("caseStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDetails_bioId_key" ON "public"."ServiceDetails"("bioId");

-- CreateIndex
CREATE INDEX "ServiceDetails_id_idx" ON "public"."ServiceDetails"("id");

-- CreateIndex
CREATE INDEX "ServiceDetails_typeOfService_idx" ON "public"."ServiceDetails"("typeOfService");

-- AddForeignKey
ALTER TABLE "public"."CaseDetails" ADD CONSTRAINT "CaseDetails_requesterReporterProfileId_fkey" FOREIGN KEY ("requesterReporterProfileId") REFERENCES "public"."RequesterReporterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BioDetails" ADD CONSTRAINT "BioDetails_requesterReporterProfileId_fkey" FOREIGN KEY ("requesterReporterProfileId") REFERENCES "public"."RequesterReporterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BioDetails" ADD CONSTRAINT "BioDetails_supportOrgProfileId_fkey" FOREIGN KEY ("supportOrgProfileId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceDetails" ADD CONSTRAINT "ServiceDetails_bioId_fkey" FOREIGN KEY ("bioId") REFERENCES "public"."BioDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

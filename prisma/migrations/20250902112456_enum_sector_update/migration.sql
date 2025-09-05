-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Sector" ADD VALUE 'crisis_support';
ALTER TYPE "public"."Sector" ADD VALUE 'social_welfare_and_Livelihood_support_services';
ALTER TYPE "public"."Sector" ADD VALUE 'health_medical_services';
ALTER TYPE "public"."Sector" ADD VALUE 'community_advocacy';
ALTER TYPE "public"."Sector" ADD VALUE 'disability_and_inclusion';
ALTER TYPE "public"."Sector" ADD VALUE 'technology_and_digital_rights';
ALTER TYPE "public"."Sector" ADD VALUE 'health_and_rehabilitation_services';

-- CreateIndex
CREATE INDEX "SupportOrgProfile_sector_idx" ON "public"."SupportOrgProfile"("sector");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_customSector_idx" ON "public"."SupportOrgProfile"("customSector");

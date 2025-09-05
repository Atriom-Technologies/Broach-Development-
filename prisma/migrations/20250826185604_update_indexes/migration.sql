-- DropIndex
DROP INDEX "public"."CaseDetails_location_idx";

-- DropIndex
DROP INDEX "public"."SupportOrgProfile_sector_idx";

-- CreateIndex
CREATE INDEX "AssailantDetails_id_idx" ON "public"."AssailantDetails"("id");

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_fullName_idx" ON "public"."RequesterReporterProfile"("fullName");

-- CreateIndex
CREATE INDEX "VictimDetails_id_idx" ON "public"."VictimDetails"("id");

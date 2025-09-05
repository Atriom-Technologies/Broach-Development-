/*
  Warnings:

  - You are about to drop the column `sector` on the `SupportOrgProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."SupportOrgProfile_sector_idx";

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" DROP COLUMN "sector";

-- CreateTable
CREATE TABLE "public"."SupportOrgSector" (
    "id" TEXT NOT NULL,
    "sector" "public"."Sector" NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "SupportOrgSector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportOrgSector_sector_idx" ON "public"."SupportOrgSector"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "SupportOrgSector_sector_orgId_key" ON "public"."SupportOrgSector"("sector", "orgId");

-- AddForeignKey
ALTER TABLE "public"."SupportOrgSector" ADD CONSTRAINT "SupportOrgSector_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

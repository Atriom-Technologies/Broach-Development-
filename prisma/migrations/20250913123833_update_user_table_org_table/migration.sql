/*
  Warnings:

  - You are about to drop the column `fullName` on the `RequesterReporterProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `SupportOrgProfile` table. All the data in the column will be lost.
  - Added the required column `address` to the `SupportOrgProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RequesterReporterProfile_fullName_idx";

-- DropIndex
DROP INDEX "public"."SupportOrgProfile_fullName_idx";

-- AlterTable
ALTER TABLE "public"."RequesterReporterProfile" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" DROP COLUMN "fullName",
ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "fullName" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "User_fullName_idx" ON "public"."User"("fullName");

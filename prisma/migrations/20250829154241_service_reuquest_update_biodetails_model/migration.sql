/*
  Warnings:

  - You are about to drop the column `AgeRange` on the `BioDetails` table. All the data in the column will be lost.
  - You are about to drop the column `Email` on the `BioDetails` table. All the data in the column will be lost.
  - You are about to drop the column `Phone` on the `BioDetails` table. All the data in the column will be lost.
  - You are about to drop the column `WhoNeedsThisService` on the `BioDetails` table. All the data in the column will be lost.
  - Added the required column `whoNeedsThisService` to the `BioDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."BioDetails_Email_key";

-- DropIndex
DROP INDEX "public"."BioDetails_Phone_key";

-- AlterTable
ALTER TABLE "public"."BioDetails" DROP COLUMN "AgeRange",
DROP COLUMN "Email",
DROP COLUMN "Phone",
DROP COLUMN "WhoNeedsThisService",
ADD COLUMN     "ageRange" "public"."AgeRange",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "whoNeedsThisService" "public"."WhoIsReporting" NOT NULL;

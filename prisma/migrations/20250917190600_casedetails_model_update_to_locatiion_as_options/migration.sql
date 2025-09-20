-- AlterTable
ALTER TABLE "public"."CaseDetails" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "infoConfirmed" SET DEFAULT false;

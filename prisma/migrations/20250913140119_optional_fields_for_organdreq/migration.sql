-- AlterTable
ALTER TABLE "public"."RequesterReporterProfile" ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "occupation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SupportOrgProfile" ALTER COLUMN "dateEstablished" DROP NOT NULL,
ALTER COLUMN "organizationSize" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

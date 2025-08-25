-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('REQUESTER_REPORTER', 'SUPPORT_ORGANIZATION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('MENTAL_HEALTH', 'LEGAL_ASSISTANCE', 'GENDER_BASED_ADVOCACY', 'HUMAN_RIGHTS', 'CHILD_RIGHTS', 'OTHERS');

-- CreateEnum
CREATE TYPE "OrgSize" AS ENUM ('SIZE_5_10', 'SIZE_10_20', 'SIZE_20_50', 'SIZE_50_PLUS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequesterReporterProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT NOT NULL,
    "profilePicture" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RequesterReporterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportOrgProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "sector" "Sector" NOT NULL,
    "customSector" TEXT,
    "dateEstablished" TIMESTAMP(3) NOT NULL,
    "organizationSize" "OrgSize" NOT NULL,
    "alternatePhone" TEXT,
    "organizationLogo" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SupportOrgProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RequesterReporterProfile_userId_key" ON "RequesterReporterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportOrgProfile_userId_key" ON "SupportOrgProfile"("userId");

-- AddForeignKey
ALTER TABLE "RequesterReporterProfile" ADD CONSTRAINT "RequesterReporterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportOrgProfile" ADD CONSTRAINT "SupportOrgProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

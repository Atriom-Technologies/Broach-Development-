-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('requester_reporter', 'support_organization');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'mixed');

-- CreateEnum
CREATE TYPE "public"."OrgSize" AS ENUM ('size_5_10', 'size_10_20', 'size_20_50', 'size_50_plus');

-- CreateEnum
CREATE TYPE "public"."WhoIsReporting" AS ENUM ('self', 'parent_guardian', 'spouse', 'witness', 'others');

-- CreateEnum
CREATE TYPE "public"."Location" AS ENUM ('victim_home', 'perpetrator_home', 'neutral_location', 'school', 'workspace', 'online', 'others');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('pending', 'in_discussion', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "public"."AgeRange" AS ENUM ('less_than_18', 'from_18_to_25', 'from_26_to_35', 'from_36_to_45', 'above_45');

-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('employed', 'unemployed', 'self_employed');

-- CreateEnum
CREATE TYPE "public"."NoOfAssailants" AS ENUM ('less_than_2', 'from_2_5', 'from_5_10', 'over_10');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('single', 'married', 'separated', 'divorced');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RequesterReporterProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT NOT NULL,
    "profilePicture" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RequesterReporterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportOrgProfile" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "customSector" TEXT,
    "dateEstablished" TIMESTAMP(3) NOT NULL,
    "organizationSize" "public"."OrgSize" NOT NULL,
    "alternatePhone" TEXT,
    "organizationLogo" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SupportOrgProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportOrgSector" (
    "id" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "SupportOrgSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseDetails" (
    "id" TEXT NOT NULL,
    "requesterReporterProfileId" TEXT,
    "caseTypeId" TEXT NOT NULL,
    "whoIsReporting" "public"."WhoIsReporting" NOT NULL,
    "location" "public"."Location" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "infoConfirmed" BOOLEAN NOT NULL,
    "caseStatus" "public"."CaseStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CaseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VictimDetails" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "vulnerabilityStatusId" TEXT,
    "ageRange" "public"."AgeRange" NOT NULL,
    "employmentStatus" "public"."EmploymentStatus" NOT NULL,
    "gender" "public"."Gender" NOT NULL,

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

-- CreateTable
CREATE TABLE "public"."ServiceRequests" (
    "id" TEXT NOT NULL,
    "requesterReporterProfileId" TEXT,
    "whoNeedsThisService" "public"."WhoIsReporting" NOT NULL,
    "ageRange" "public"."AgeRange",
    "phone" TEXT,
    "email" TEXT,
    "infoConfirmed" BOOLEAN NOT NULL,
    "caseStatus" "public"."CaseStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceDetails" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "vulnerabilityStatusId" TEXT,
    "maritalStatus" "public"."MaritalStatus" NOT NULL,
    "workStatus" "public"."EmploymentStatus" NOT NULL,
    "description" VARCHAR(200) NOT NULL,

    CONSTRAINT "ServiceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CaseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VulnerabilityStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VulnerabilityStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseAssignment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceAssignment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "organizationId" TEXT,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "public"."User"("userType");

-- CreateIndex
CREATE UNIQUE INDEX "RequesterReporterProfile_userId_key" ON "public"."RequesterReporterProfile"("userId");

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_fullName_idx" ON "public"."RequesterReporterProfile"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "SupportOrgProfile_userId_key" ON "public"."SupportOrgProfile"("userId");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_userId_idx" ON "public"."SupportOrgProfile"("userId");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_fullName_idx" ON "public"."SupportOrgProfile"("fullName");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_customSector_idx" ON "public"."SupportOrgProfile"("customSector");

-- CreateIndex
CREATE INDEX "SupportOrgSector_sectorId_idx" ON "public"."SupportOrgSector"("sectorId");

-- CreateIndex
CREATE INDEX "SupportOrgSector_organizationId_idx" ON "public"."SupportOrgSector"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportOrgSector_sectorId_organizationId_key" ON "public"."SupportOrgSector"("sectorId", "organizationId");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_expiresAt_idx" ON "public"."RefreshSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshSession_expiresAt_idx" ON "public"."RefreshSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CaseDetails_requesterReporterProfileId_idx" ON "public"."CaseDetails"("requesterReporterProfileId");

-- CreateIndex
CREATE INDEX "CaseDetails_caseTypeId_idx" ON "public"."CaseDetails"("caseTypeId");

-- CreateIndex
CREATE INDEX "CaseDetails_caseStatus_idx" ON "public"."CaseDetails"("caseStatus");

-- CreateIndex
CREATE INDEX "CaseDetails_createdAt_idx" ON "public"."CaseDetails"("createdAt");

-- CreateIndex
CREATE INDEX "CaseDetails_updatedAt_idx" ON "public"."CaseDetails"("updatedAt");

-- CreateIndex
CREATE INDEX "CaseDetails_deletedAt_idx" ON "public"."CaseDetails"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VictimDetails_caseId_key" ON "public"."VictimDetails"("caseId");

-- CreateIndex
CREATE INDEX "VictimDetails_vulnerabilityStatusId_idx" ON "public"."VictimDetails"("vulnerabilityStatusId");

-- CreateIndex
CREATE INDEX "VictimDetails_caseId_idx" ON "public"."VictimDetails"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "AssailantDetails_caseId_key" ON "public"."AssailantDetails"("caseId");

-- CreateIndex
CREATE INDEX "AssailantDetails_caseId_idx" ON "public"."AssailantDetails"("caseId");

-- CreateIndex
CREATE INDEX "ServiceRequests_requesterReporterProfileId_idx" ON "public"."ServiceRequests"("requesterReporterProfileId");

-- CreateIndex
CREATE INDEX "ServiceRequests_caseStatus_idx" ON "public"."ServiceRequests"("caseStatus");

-- CreateIndex
CREATE INDEX "ServiceRequests_createdAt_idx" ON "public"."ServiceRequests"("createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequests_updatedAt_idx" ON "public"."ServiceRequests"("updatedAt");

-- CreateIndex
CREATE INDEX "ServiceRequests_deletedAt_idx" ON "public"."ServiceRequests"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDetails_serviceRequestId_key" ON "public"."ServiceDetails"("serviceRequestId");

-- CreateIndex
CREATE INDEX "ServiceDetails_serviceTypeId_idx" ON "public"."ServiceDetails"("serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_key" ON "public"."Sector"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CaseType_name_key" ON "public"."CaseType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VulnerabilityStatus_name_key" ON "public"."VulnerabilityStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "public"."ServiceType"("name");

-- CreateIndex
CREATE INDEX "CaseAssignment_caseId_status_idx" ON "public"."CaseAssignment"("caseId", "status");

-- CreateIndex
CREATE INDEX "CaseAssignment_organizationId_idx" ON "public"."CaseAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "CaseAssignment_status_idx" ON "public"."CaseAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAssignment_caseId_organizationId_key" ON "public"."CaseAssignment"("caseId", "organizationId");

-- CreateIndex
CREATE INDEX "ServiceAssignment_serviceId_status_idx" ON "public"."ServiceAssignment"("serviceId", "status");

-- CreateIndex
CREATE INDEX "ServiceAssignment_organizationId_idx" ON "public"."ServiceAssignment"("organizationId");

-- CreateIndex
CREATE INDEX "ServiceAssignment_status_idx" ON "public"."ServiceAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAssignment_serviceId_organizationId_key" ON "public"."ServiceAssignment"("serviceId", "organizationId");

-- AddForeignKey
ALTER TABLE "public"."RequesterReporterProfile" ADD CONSTRAINT "RequesterReporterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportOrgProfile" ADD CONSTRAINT "SupportOrgProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportOrgSector" ADD CONSTRAINT "SupportOrgSector_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportOrgSector" ADD CONSTRAINT "SupportOrgSector_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "public"."Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseDetails" ADD CONSTRAINT "CaseDetails_requesterReporterProfileId_fkey" FOREIGN KEY ("requesterReporterProfileId") REFERENCES "public"."RequesterReporterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseDetails" ADD CONSTRAINT "CaseDetails_caseTypeId_fkey" FOREIGN KEY ("caseTypeId") REFERENCES "public"."CaseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VictimDetails" ADD CONSTRAINT "VictimDetails_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VictimDetails" ADD CONSTRAINT "VictimDetails_vulnerabilityStatusId_fkey" FOREIGN KEY ("vulnerabilityStatusId") REFERENCES "public"."VulnerabilityStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssailantDetails" ADD CONSTRAINT "AssailantDetails_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceRequests" ADD CONSTRAINT "ServiceRequests_requesterReporterProfileId_fkey" FOREIGN KEY ("requesterReporterProfileId") REFERENCES "public"."RequesterReporterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceDetails" ADD CONSTRAINT "ServiceDetails_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "public"."ServiceRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceDetails" ADD CONSTRAINT "ServiceDetails_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "public"."ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceDetails" ADD CONSTRAINT "ServiceDetails_vulnerabilityStatusId_fkey" FOREIGN KEY ("vulnerabilityStatusId") REFERENCES "public"."VulnerabilityStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseAssignment" ADD CONSTRAINT "CaseAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."CaseDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseAssignment" ADD CONSTRAINT "CaseAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ServiceRequests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."SupportOrgProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

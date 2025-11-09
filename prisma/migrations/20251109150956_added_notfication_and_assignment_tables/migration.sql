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
CREATE TYPE "public"."AgeRange" AS ENUM ('less_than_18', 'from_18_to_25', 'from_26_to_35', 'from_36_to_45', 'above_45');

-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('employed', 'unemployed', 'self_employed');

-- CreateEnum
CREATE TYPE "public"."NoOfAssailants" AS ENUM ('less_than_2', 'from_2_5', 'from_5_10', 'over_10');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('single', 'married', 'separated', 'divorced');

-- CreateEnum
CREATE TYPE "public"."EngagementType" AS ENUM ('CASE_REPORT', 'SERVICE_REQUEST');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('pending', 'in_discussion', 'closed');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('pending', 'in_discussion', 'closed');

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
    "gender" "public"."Gender",
    "dateOfBirth" DATE,
    "occupation" TEXT,
    "profilePicture" TEXT,
    "coverPhoto" TEXT,
    "location" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RequesterReporterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportOrgProfile" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "customSector" TEXT,
    "dateEstablished" DATE,
    "organizationSize" "public"."OrgSize",
    "address" TEXT,
    "alternatePhone" TEXT,
    "organizationLogoUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SupportOrgProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."CaseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CaseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseDetails" (
    "id" TEXT NOT NULL,
    "requesterReporterProfileId" TEXT,
    "caseTypeId" TEXT NOT NULL,
    "whoIsReporting" "public"."WhoIsReporting" NOT NULL,
    "location" "public"."Location",
    "description" VARCHAR(200) NOT NULL,
    "infoConfirmed" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "public"."ServiceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VulnerabilityStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VulnerabilityStatus_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "type" "public"."EngagementType" NOT NULL,
    "relatedId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "message" TEXT,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" TEXT NOT NULL,
    "type" "public"."EngagementType" NOT NULL,
    "relatedId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'pending',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "User_userType_idx" ON "public"."User"("userType");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "public"."User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RequesterReporterProfile_userId_key" ON "public"."RequesterReporterProfile"("userId");

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_fullName_idx" ON "public"."RequesterReporterProfile"("fullName");

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_id_idx" ON "public"."RequesterReporterProfile"("id");

-- CreateIndex
CREATE INDEX "RequesterReporterProfile_userId_idx" ON "public"."RequesterReporterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportOrgProfile_userId_key" ON "public"."SupportOrgProfile"("userId");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_userId_idx" ON "public"."SupportOrgProfile"("userId");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_organizationName_idx" ON "public"."SupportOrgProfile"("organizationName");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_customSector_idx" ON "public"."SupportOrgProfile"("customSector");

-- CreateIndex
CREATE INDEX "SupportOrgProfile_id_idx" ON "public"."SupportOrgProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_key" ON "public"."Sector"("name");

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
CREATE UNIQUE INDEX "CaseType_name_key" ON "public"."CaseType"("name");

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
CREATE UNIQUE INDEX "ServiceType_name_key" ON "public"."ServiceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VulnerabilityStatus_name_key" ON "public"."VulnerabilityStatus"("name");

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
CREATE UNIQUE INDEX "PasswordReset_userId_key" ON "public"."PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "public"."PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "public"."PasswordReset"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordReset_createdAt_idx" ON "public"."PasswordReset"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "public"."Notification"("senderId");

-- CreateIndex
CREATE INDEX "Notification_receiverId_idx" ON "public"."Notification"("receiverId");

-- CreateIndex
CREATE INDEX "Notification_relatedId_idx" ON "public"."Notification"("relatedId");

-- CreateIndex
CREATE INDEX "Assignment_relatedId_type_idx" ON "public"."Assignment"("relatedId", "type");

-- CreateIndex
CREATE INDEX "Assignment_organizationId_idx" ON "public"."Assignment"("organizationId");

-- CreateIndex
CREATE INDEX "Assignment_reporterId_idx" ON "public"."Assignment"("reporterId");

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
ALTER TABLE "public"."PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

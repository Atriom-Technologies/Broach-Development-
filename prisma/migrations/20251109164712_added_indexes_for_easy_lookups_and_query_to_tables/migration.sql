-- CreateIndex
CREATE INDEX "Assignment_id_idx" ON "public"."Assignment"("id");

-- CreateIndex
CREATE INDEX "CaseDetails_id_idx" ON "public"."CaseDetails"("id");

-- CreateIndex
CREATE INDEX "CaseType_id_idx" ON "public"."CaseType"("id");

-- CreateIndex
CREATE INDEX "CaseType_name_idx" ON "public"."CaseType"("name");

-- CreateIndex
CREATE INDEX "Notification_id_idx" ON "public"."Notification"("id");

-- CreateIndex
CREATE INDEX "PasswordReset_id_idx" ON "public"."PasswordReset"("id");

-- CreateIndex
CREATE INDEX "RefreshSession_id_idx" ON "public"."RefreshSession"("id");

-- CreateIndex
CREATE INDEX "ServiceRequests_id_idx" ON "public"."ServiceRequests"("id");

-- CreateIndex
CREATE INDEX "ServiceType_id_idx" ON "public"."ServiceType"("id");

-- CreateIndex
CREATE INDEX "SupportOrgSector_id_idx" ON "public"."SupportOrgSector"("id");

-- CreateIndex
CREATE INDEX "VulnerabilityStatus_id_idx" ON "public"."VulnerabilityStatus"("id");

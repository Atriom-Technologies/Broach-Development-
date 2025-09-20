-- AlterTable
ALTER TABLE "public"."PasswordReset" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "public"."PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_email_idx" ON "public"."PasswordReset"("email");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "public"."PasswordReset"("expiresAt");

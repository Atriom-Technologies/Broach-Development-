/*
  Warnings:

  - You are about to drop the column `email` on the `PasswordReset` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."PasswordReset_email_idx";

-- DropIndex
DROP INDEX "public"."PasswordReset_email_key";

-- AlterTable
ALTER TABLE "public"."PasswordReset" DROP COLUMN "email";

-- CreateIndex
CREATE INDEX "PasswordReset_createdAt_idx" ON "public"."PasswordReset"("createdAt");

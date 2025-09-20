/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `PasswordReset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."PasswordReset" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_email_key" ON "public"."PasswordReset"("email");

/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `PasswordReset` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PasswordReset" DROP COLUMN "deletedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

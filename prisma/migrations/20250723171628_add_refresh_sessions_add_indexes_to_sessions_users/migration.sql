/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `RefreshSession` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - Added the required column `refreshToken` to the `RefreshSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshSession" DROP COLUMN "tokenHash",
ADD COLUMN     "refreshToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshToken";

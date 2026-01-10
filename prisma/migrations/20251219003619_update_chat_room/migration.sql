-- AlterTable
ALTER TABLE "public"."ChatRoom" ADD COLUMN     "orgJoined" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reporterJoined" BOOLEAN NOT NULL DEFAULT false;

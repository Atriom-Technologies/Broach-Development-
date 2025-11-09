/*
  Warnings:

  - The `status` column on the `Assignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Assignment" DROP COLUMN "status",
ADD COLUMN     "status" "public"."NotificationStatus" NOT NULL DEFAULT 'in_discussion';

-- DropEnum
DROP TYPE "public"."AssignmentStatus";

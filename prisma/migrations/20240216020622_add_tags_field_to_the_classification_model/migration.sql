/*
  Warnings:

  - Added the required column `tags` to the `classifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "classifications" DROP CONSTRAINT "classifications_userId_fkey";

-- AlterTable
ALTER TABLE "classifications" ADD COLUMN     "tags" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

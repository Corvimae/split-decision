/*
  Warnings:

  - You are about to drop the column `runnerId` on the `GameSubmission` table. All the data in the column will be lost.
  - You are about to drop the `Runner` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `GameSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameSubmission" DROP CONSTRAINT "GameSubmission_runnerId_fkey";

-- AlterTable
ALTER TABLE "GameSubmission" DROP COLUMN "runnerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "pronouns" TEXT,
ADD COLUMN     "showPronouns" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Runner";

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

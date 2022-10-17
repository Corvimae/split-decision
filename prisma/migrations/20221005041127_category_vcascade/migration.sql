-- DropForeignKey
ALTER TABLE "GameSubmissionCategory" DROP CONSTRAINT "GameSubmissionCategory_gameSubmissionId_fkey";

-- AddForeignKey
ALTER TABLE "GameSubmissionCategory" ADD CONSTRAINT "GameSubmissionCategory_gameSubmissionId_fkey" FOREIGN KEY ("gameSubmissionId") REFERENCES "GameSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EventAvailability" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GameSubmission" ALTER COLUMN "secondaryGenre" DROP DEFAULT,
ALTER COLUMN "technicalNotes" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GameSubmissionCategory" ALTER COLUMN "updatedAt" DROP DEFAULT;

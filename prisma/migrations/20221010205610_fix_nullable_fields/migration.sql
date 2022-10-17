-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EventAvailability" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GameSubmission" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "secondaryGenre" DROP NOT NULL,
ALTER COLUMN "technicalNotes" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GameSubmissionCategory" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

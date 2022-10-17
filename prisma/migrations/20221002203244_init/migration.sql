-- CreateEnum
CREATE TYPE "GameCategorySubcommittee" AS ENUM ('Horror', 'Platforming', 'Other');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('Accpeted', 'Rejected', 'Backup', 'Bonus', 'Pending');

-- CreateTable
CREATE TABLE "Runner" (
    "id" TEXT NOT NULL,
    "discordID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "showPronouns" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "gameSubmissionPeriodStart" TIMESTAMP(3) NOT NULL,
    "gameSubmissionPeriodEnd" TIMESTAMP(3) NOT NULL,
    "eventStart" TIMESTAMP(3) NOT NULL,
    "runStatusVisible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSubmission" (
    "id" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "gameTitle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gameSubcommittee" "GameCategorySubcommittee" NOT NULL,

    CONSTRAINT "GameSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSubmissionCategory" (
    "id" TEXT NOT NULL,
    "gameSubmissionId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "videoURL" TEXT NOT NULL,
    "estimate" TEXT NOT NULL,
    "runStatus" "RunStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "GameSubmissionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Runner_id_key" ON "Runner"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Runner_discordID_key" ON "Runner"("discordID");

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_key" ON "Event"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameSubmission_id_key" ON "GameSubmission"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GameSubmissionCategory_id_key" ON "GameSubmissionCategory"("id");

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSubmissionCategory" ADD CONSTRAINT "GameSubmissionCategory_gameSubmissionId_fkey" FOREIGN KEY ("gameSubmissionId") REFERENCES "GameSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

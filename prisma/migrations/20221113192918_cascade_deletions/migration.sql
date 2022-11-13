-- DropForeignKey
ALTER TABLE "EventAvailability" DROP CONSTRAINT "EventAvailability_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventAvailability" DROP CONSTRAINT "EventAvailability_userId_fkey";

-- DropForeignKey
ALTER TABLE "GameSubmission" DROP CONSTRAINT "GameSubmission_eventId_fkey";

-- DropForeignKey
ALTER TABLE "GameSubmission" DROP CONSTRAINT "GameSubmission_userId_fkey";

-- AddForeignKey
ALTER TABLE "EventAvailability" ADD CONSTRAINT "EventAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAvailability" ADD CONSTRAINT "EventAvailability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSubmission" ADD CONSTRAINT "GameSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

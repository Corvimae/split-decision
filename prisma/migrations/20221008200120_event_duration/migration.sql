-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endTime" INTEGER NOT NULL DEFAULT 23,
ADD COLUMN     "eventDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "startTime" INTEGER NOT NULL DEFAULT 9;
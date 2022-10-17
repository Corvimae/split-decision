/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId]` on the table `EventAvailability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventAvailability_userId_eventId_key" ON "EventAvailability"("userId", "eventId");

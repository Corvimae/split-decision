/*
  Warnings:

  - Added the required column `description` to the `GameSubmissionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameSubmissionCategory" ADD COLUMN     "description" TEXT NOT NULL;

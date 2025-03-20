/*
  Warnings:

  - Added the required column `fileType` to the `Pdf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "fileType" TEXT NOT NULL;

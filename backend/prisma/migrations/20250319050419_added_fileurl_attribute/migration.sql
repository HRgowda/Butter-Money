/*
  Warnings:

  - Added the required column `fileUrl` to the `Pdf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "fileUrl" TEXT NOT NULL;

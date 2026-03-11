/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `password_resets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "password_resets_adminId_key" ON "password_resets"("adminId");

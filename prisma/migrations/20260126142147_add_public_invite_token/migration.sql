/*
  Warnings:

  - A unique constraint covering the columns `[invite_token]` on the table `events` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "invite_token" TEXT NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "events_invite_token_key" ON "events"("invite_token");

ALTER TABLE "case_attempt" ADD COLUMN "commandId" TEXT;
CREATE UNIQUE INDEX "case_attempt_userId_commandId_key" ON "case_attempt"("userId", "commandId");
ALTER TABLE "competition_queue" ADD COLUMN "scoringVersion" INTEGER NOT NULL DEFAULT 1;
CREATE INDEX "competition_queue_version_fifo_idx" ON "competition_queue"("league", "challengeId", "challengeVersion", "scoringVersion", "status", "createdAt");

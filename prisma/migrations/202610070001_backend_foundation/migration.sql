-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('WAITING', 'PLAYING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'MATCHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_rate_limit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "auth_rate_limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_profile" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'blue',
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "persona" TEXT,
    "targetRoleId" TEXT NOT NULL DEFAULT 'junior-accountant',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "cloud_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "provenance" TEXT NOT NULL DEFAULT 'SERVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cloud_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "revision" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_import" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "importVersion" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legacy_import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "userId" TEXT NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "career_goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetRoleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_profile" (
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "skill_evidence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evidenceKey" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_version" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commandId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "caseVersion" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_event" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "action" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accepted_outcome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outcomeKey" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accepted_outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_player" (
    "userId" TEXT NOT NULL,
    "activeMatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_player_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "competition_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "challengeVersion" INTEGER NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_match" (
    "id" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "challengeVersion" INTEGER NOT NULL,
    "scoringVersion" INTEGER NOT NULL DEFAULT 1,
    "issuedFor" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PLAYING',
    "winnerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "competition_match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_match_player" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER,
    "inspected" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "competition_match_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "challengeVersion" INTEGER NOT NULL,
    "scoringVersion" INTEGER NOT NULL,
    "league" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE INDEX "app_user_createdAt_idx" ON "app_user"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_token_key" ON "auth_session"("token");

-- CreateIndex
CREATE INDEX "auth_session_userId_idx" ON "auth_session"("userId");

-- CreateIndex
CREATE INDEX "auth_session_expiresAt_idx" ON "auth_session"("expiresAt");

-- CreateIndex
CREATE INDEX "auth_account_userId_idx" ON "auth_account"("userId");

-- CreateIndex
CREATE INDEX "auth_account_providerId_idx" ON "auth_account"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_account_providerId_accountId_key" ON "auth_account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification"("identifier");

-- CreateIndex
CREATE INDEX "auth_verification_expiresAt_idx" ON "auth_verification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "auth_rate_limit_key_key" ON "auth_rate_limit"("key");

-- CreateIndex
CREATE UNIQUE INDEX "player_profile_handle_key" ON "player_profile"("handle");

-- CreateIndex
CREATE INDEX "player_profile_persona_idx" ON "player_profile"("persona");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_progress_userId_domain_key" ON "cloud_progress"("userId", "domain");

-- CreateIndex
CREATE INDEX "progress_snapshot_createdAt_idx" ON "progress_snapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "progress_snapshot_userId_domain_revision_key" ON "progress_snapshot"("userId", "domain", "revision");

-- CreateIndex
CREATE INDEX "legacy_import_userId_deviceId_idx" ON "legacy_import"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_import_userId_importVersion_checksum_key" ON "legacy_import"("userId", "importVersion", "checksum");

-- CreateIndex
CREATE INDEX "user_activity_lastActiveAt_idx" ON "user_activity"("lastActiveAt");

-- CreateIndex
CREATE INDEX "career_goal_userId_createdAt_idx" ON "career_goal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "skill_evidence_userId_skillId_idx" ON "skill_evidence"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_evidence_userId_evidenceKey_key" ON "skill_evidence"("userId", "evidenceKey");

-- CreateIndex
CREATE INDEX "cv_version_userId_createdAt_idx" ON "cv_version"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "mission_attempt_userId_missionId_idx" ON "mission_attempt"("userId", "missionId");

-- CreateIndex
CREATE UNIQUE INDEX "mission_attempt_userId_commandId_key" ON "mission_attempt"("userId", "commandId");

-- CreateIndex
CREATE INDEX "case_attempt_userId_caseId_caseVersion_idx" ON "case_attempt"("userId", "caseId", "caseVersion");

-- CreateIndex
CREATE UNIQUE INDEX "case_event_attemptId_eventKey_key" ON "case_event"("attemptId", "eventKey");

-- CreateIndex
CREATE UNIQUE INDEX "accepted_outcome_userId_outcomeKey_key" ON "accepted_outcome"("userId", "outcomeKey");

-- CreateIndex
CREATE INDEX "competition_player_activeMatchId_idx" ON "competition_player"("activeMatchId");

-- CreateIndex
CREATE INDEX "competition_queue_league_challengeId_challengeVersion_statu_idx" ON "competition_queue"("league", "challengeId", "challengeVersion", "status", "createdAt");

-- CreateIndex
CREATE INDEX "competition_queue_userId_status_idx" ON "competition_queue"("userId", "status");

-- CreateIndex
CREATE INDEX "competition_match_status_createdAt_idx" ON "competition_match"("status", "createdAt");

-- CreateIndex
CREATE INDEX "competition_match_player_userId_submittedAt_idx" ON "competition_match_player"("userId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "competition_match_player_matchId_userId_key" ON "competition_match_player"("matchId", "userId");

-- CreateIndex
CREATE INDEX "competition_attempt_league_createdAt_score_idx" ON "competition_attempt"("league", "createdAt", "score");

-- CreateIndex
CREATE UNIQUE INDEX "competition_attempt_userId_challengeId_challengeVersion_sco_key" ON "competition_attempt"("userId", "challengeId", "challengeVersion", "scoringVersion");

-- CreateIndex
CREATE INDEX "audit_log_userId_createdAt_idx" ON "audit_log"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_profile" ADD CONSTRAINT "player_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cloud_progress" ADD CONSTRAINT "cloud_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_snapshot" ADD CONSTRAINT "progress_snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_import" ADD CONSTRAINT "legacy_import_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_goal" ADD CONSTRAINT "career_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_profile" ADD CONSTRAINT "career_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_version" ADD CONSTRAINT "cv_version_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_attempt" ADD CONSTRAINT "mission_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_attempt" ADD CONSTRAINT "case_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_event" ADD CONSTRAINT "case_event_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "case_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accepted_outcome" ADD CONSTRAINT "accepted_outcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_player" ADD CONSTRAINT "competition_player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_queue" ADD CONSTRAINT "competition_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_match_player" ADD CONSTRAINT "competition_match_player_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "competition_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_match_player" ADD CONSTRAINT "competition_match_player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_attempt" ADD CONSTRAINT "competition_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A waiting user can have only one active queue row across all challenges.
CREATE UNIQUE INDEX competition_queue_one_waiting_user ON competition_queue ("userId") WHERE status = 'WAITING';

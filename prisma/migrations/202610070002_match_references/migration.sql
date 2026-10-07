ALTER TABLE "competition_player" ADD CONSTRAINT "competition_player_activeMatchId_fkey" FOREIGN KEY ("activeMatchId") REFERENCES "competition_match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competition_match" ADD CONSTRAINT "competition_match_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competition_attempt" ADD CONSTRAINT "competition_attempt_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "competition_match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

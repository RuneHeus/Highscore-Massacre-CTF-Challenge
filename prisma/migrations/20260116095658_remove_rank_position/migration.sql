/*
  Warnings:

  - You are about to drop the column `rank_position` on the `Leaderboard_entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Leaderboard_entry" DROP COLUMN "rank_position";

-- CreateIndex
CREATE INDEX "Leaderboard_entry_game_id_score_idx" ON "Leaderboard_entry"("game_id", "score" DESC);

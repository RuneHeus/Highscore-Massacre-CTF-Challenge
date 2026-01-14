-- CreateTable
CREATE TABLE "Game" (
    "game_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_plays" INTEGER NOT NULL DEFAULT 0,
    "all_time_high_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "Game_session" (
    "session_id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "final_score" INTEGER NOT NULL,
    "time_played_seconds" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,

    CONSTRAINT "Game_session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Leaderboard_entry" (
    "entry_id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "player_name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "achieved_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank_position" INTEGER NOT NULL,

    CONSTRAINT "Leaderboard_entry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_entry_session_id_key" ON "Leaderboard_entry"("session_id");

-- AddForeignKey
ALTER TABLE "Game_session" ADD CONSTRAINT "Game_session_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard_entry" ADD CONSTRAINT "Leaderboard_entry_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard_entry" ADD CONSTRAINT "Leaderboard_entry_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Game_session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

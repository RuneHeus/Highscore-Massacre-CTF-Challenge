/*
  Warnings:

  - You are about to drop the column `ip_address` on the `Game_session` table. All the data in the column will be lost.
  - Added the required column `player_id` to the `Game_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game_session" DROP COLUMN "ip_address",
ADD COLUMN     "player_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Player" (
    "player_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("player_id")
);

-- AddForeignKey
ALTER TABLE "Game_session" ADD CONSTRAINT "Game_session_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

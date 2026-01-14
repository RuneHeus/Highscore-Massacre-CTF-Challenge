import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const game = await prisma.game.create({
    data: {
      title: 'Highscore Massacre',
      description: 'Arcade survival game',
      instructions: 'Survive as long as possible',
      thumbnail_url: '/img/thumb.png',
    }
  });

  for (let i = 1; i <= 10; i++) {
    const session = await prisma.game_session.create({
      data: {
        game_id: game.game_id,
        start_time: new Date(),
        end_time: new Date(),
        final_score: i * 100,
        time_played_seconds: 60 * i,
        status: 'finished',
        ip_address: `192.168.0.${i}`
      }
    });

    await prisma.leaderboard_entry.create({
      data: {
        game_id: game.game_id,
        session_id: session.session_id,
        player_name: `Player${i}`,
        score: i * 100,
        rank_position: i
      }
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
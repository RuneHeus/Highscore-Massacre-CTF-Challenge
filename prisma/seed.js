import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const survivors = [
  { name: "AliceHardy",    score: 123 },
  { name: "GinnyField",    score: 121 },
  { name: "ChrisHiggins",  score: 198 },
  { name: "TrishJarvis",   score: 167 },
  { name: "TommyJarvis",   score: 101 },
  { name: "MeganGarris",   score: 99 },
  { name: "TinaShepard",   score: 43 },
  { name: "RennieWickham", score: 32 },
  { name: "JessicaKimble", score: 23 },
  { name: "WhitneyMiller", score: 15 }
];

async function main() {
  const game = await prisma.game.create({
    data: {
      title: "Highscore Massacre",
      description: "Arcade survival game",
      instructions: "Survive as long as possible",
      thumbnail_url: "/img/thumb.png",
    },
  });

  // Regular survivors
  for (let i = 0; i < survivors.length; i++) {
    const { name, score } = survivors[i];

    const session = await prisma.game_session.create({
      data: {
        game_id: game.game_id,
        start_time: new Date(Date.now() - score * 1000),
        end_time: new Date(),
        final_score: score,
        time_played_seconds: Math.floor(score / 2),
        status: "finished",
        ip_address: `192.168.0.${10 + i}`,
      },
    });

    await prisma.leaderboard_entry.create({
      data: {
        game_id: game.game_id,
        session_id: session.session_id,
        player_name: name,
        score: score,
      },
    });
  }

  const extremeSession = await prisma.game_session.create({
    data: {
      game_id: game.game_id,
      start_time: new Date(Date.now() - 999999 * 10),
      end_time: new Date(),
      final_score: 9999999,
      time_played_seconds: 6666,
      status: "finished",
      ip_address: "192.168.0.250",
    },
  });

  await prisma.leaderboard_entry.create({
    data: {
      game_id: game.game_id,
      session_id: extremeSession.session_id,
      player_name: "FinalCounselor",
      score: 9999999,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const survivors = [
  { name: "AliceHardy",    score: 420 },
  { name: "GinnyField",    score: 543 },
  { name: "ChrisHiggins",  score: 201 },
  { name: "TrishJarvis",   score: 545 },
  { name: "TommyJarvis",   score: 333 },
  { name: "MeganGarris",   score: 331 },
  { name: "TinaShepard",   score: 156 },
  { name: "RennieWickham", score: 940 },
  { name: "JessicaKimble", score: 643 },
  { name: "WhitneyMiller", score: 432 }
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

  // 🩸 Legendary / Unbeatable survivor
  const extremeSession = await prisma.game_session.create({
    data: {
      game_id: game.game_id,
      start_time: new Date(Date.now() - 999999 * 10),
      end_time: new Date(),
      final_score: 999999,
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
      score: 999999,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

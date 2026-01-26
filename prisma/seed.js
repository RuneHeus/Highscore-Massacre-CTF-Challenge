import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const survivors = [
  { name: "AliceHardy",    score: 545 },
  { name: "GinnyField",    score: 421 },
  { name: "ChrisHiggins",  score: 643 },
  { name: "TrishJarvis",   score: 123 },
  { name: "TommyJarvis",   score: 380 },
  { name: "MeganGarris",   score: 155 },
  { name: "TinaShepard",   score: 345 },
  { name: "RennieWickham", score: 654 },
  { name: "JessicaKimble", score: 878 },
  { name: "WhitneyMiller", score: 419 },
  { name: "PaulHolt",      score: 312 },
  { name: "VeraSanchez",   score: 501 },
  { name: "RobDier",       score: 287 },
  { name: "PamRoberts",    score: 599 },
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

  for (const { name, score } of survivors) {
    const player = await prisma.player.create({ data: {} });

    const session = await prisma.game_session.create({
      data: {
        start_time: new Date(Date.now() - score * 1000),
        end_time: new Date(),
        final_score: score,
        time_played_seconds: Math.floor(score / 2),
        status: "finished",

        game: {
          connect: { game_id: game.game_id }
        },
        player: {
          connect: { player_id: player.player_id }
        }
      },
    });

    await prisma.leaderboard_entry.create({
      data: {
        player_name: name,
        score: score,

        game: {
          connect: { game_id: game.game_id }
        },
        session: {
          connect: { session_id: session.session_id }
        }
      },
    });
  }

  const finalPlayer = await prisma.player.create({ data: {} });

  const extremeSession = await prisma.game_session.create({
    data: {
      start_time: new Date(Date.now() - 999999 * 10),
      end_time: new Date(),
      final_score: 9999999,
      time_played_seconds: 6666,
      status: "finished",

      game: {
        connect: { game_id: game.game_id }
      },
      player: {
        connect: { player_id: finalPlayer.player_id }
      }
    },
  });

  await prisma.leaderboard_entry.create({
    data: {
      player_name: "FinalCounselor",
      score: 9999999,

      game: {
        connect: { game_id: game.game_id }
      },
      session: {
        connect: { session_id: extremeSession.session_id }
      }
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

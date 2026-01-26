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
  { name: "ReggieWinter",  score: 410 },
  { name: "TrentSutton",   score: 222 },
  { name: "ClayMiller",    score: 777 },
  { name: "JennaMontgomery", score: 333 },
  { name: "ChewieWong",    score: 488 },
  { name: "LoriCampbell",  score: 555 },
  { name: "AliceJohnson",  score: 430 },
  { name: "MarkDavis",     score: 512 },
  { name: "SarahConnor",   score: 734 },
  { name: "KyleReese",     score: 289 },
  { name: "NancyThompson", score: 811 },
  { name: "GlenLantz",     score: 402 },
  { name: "TinaGray",      score: 298 },
  { name: "KristenParker", score: 650 },
  { name: "RickJohnson",   score: 360 },
  { name: "WillStanton",   score: 275 },
  { name: "MaggieThompson", score: 590 },
  { name: "RolandKincaid", score: 455 },
  { name: "DanJordan",     score: 510 },
  { name: "YvonneMiller",  score: 480 },
  { name: "GretaGibson",   score: 325 },
  { name: "CarlosRodriguez", score: 305 },
  { name: "SpencerLewis",  score: 265 },
  { name: "TracySwan",     score: 540 },
  { name: "JacobJohnson",  score: 620 },
  { name: "StevenClayton", score: 585 },
  { name: "MaggieBurrows", score: 495 },
  { name: "JasonLee",      score: 730 },
  { name: "DanaStevens",   score: 415 },
  { name: "KellyParker",   score: 370 },
  { name: "PeterSimons",   score: 605 },
  { name: "LauraCollins",  score: 520 },
  { name: "BrianCooper",   score: 275 },
  { name: "KevinMyers",    score: 450 },
  { name: "EmilyStone",    score: 560 },
  { name: "OliviaHart",    score: 335 },
  { name: "EthanPrice",    score: 710 },
  { name: "LucasFord",     score: 395 },
  { name: "ChloeWest",     score: 640 },
  { name: "ZoeHill",       score: 355 },
  { name: "LiamBrooks",    score: 715 },
  { name: "NoahGreen",     score: 525 },
  { name: "EmmaScott",     score: 380 },
  { name: "AvaBennett",    score: 465 },
  { name: "MiaAdams",      score: 430 },
  { name: "SophiaWard",    score: 590 },
  { name: "IsabellaCox",   score: 320 },
  { name: "CharlotteGray", score: 505 },
  { name: "AmeliaRoss",    score: 445 },
  { name: "HarperBell",    score: 365 },
  { name: "EvelynCook",    score: 555 },
  { name: "AbigailRogers", score: 285 },
  { name: "EllaMorgan",    score: 340 },
  { name: "AveryPeterson", score: 605 },
  { name: "ScarlettBailey", score: 475 },
  { name: "VictoriaRivera", score: 515 },
  { name: "MadisonCooper", score: 295 },
  { name: "LunaKelly",     score: 355 },
  { name: "GraceHoward",   score: 525 },
  { name: "HannahHughes",  score: 405 },
  { name: "AriaPatterson", score: 695 },
  { name: "LilyAlexander", score: 360 },
  { name: "NoraColeman",   score: 440 },
  { name: "RileyJenkins",  score: 520 },
  { name: "ZoeyPerry",     score: 335 },
  { name: "StellaPowell",  score: 285 },
  { name: "PaisleyLong",   score: 575 },
  { name: "EllieFlores",   score: 455 },
  { name: "SkylarSanders", score: 495 },
  { name: "BellaWard",     score: 345 },
  { name: "LeahRussell",   score: 405 },
  { name: "PenelopeHayes", score: 585 },
  { name: "LaylaMyers",    score: 365 },
  { name: "ChloeCruz",     score: 425 },
  { name: "SavannahBryant", score: 605 },
  { name: "AudreyFoster",  score: 335 },
  { name: "BrooklynSimmons", score: 455 },
  { name: "ClaireReed",    score: 515 },
  { name: "AuroraCook",    score: 345 },
  { name: "GenesisTorres", score: 285 },
  { name: "KennedyJames",  score: 475 },
  { name: "NaomiParker",   score: 395 },
  { name: "PiperBarnes",   score: 535 },
  { name: "QuinnFisher",   score: 355 },
  { name: "ReaganStone",   score: 445 }
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

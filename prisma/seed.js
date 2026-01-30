import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const survivors = [
  { name: "AliceHardy",    score: 99999999 },
  { name: "GinnyField",    score: 99999999 },
  { name: "ChrisHiggins",  score: 99999999 },
  { name: "TrishJarvis",   score: 99999999 },
  { name: "TommyJarvis",   score: 99999999 },
  { name: "MeganGarris",   score: 99999999 },
  { name: "TinaShepard",   score: 99999999 },
  { name: "RennieWickham", score: 99999999 },
  { name: "JessicaKimble", score: 99999999 },
  { name: "WhitneyMiller", score: 99999999 },
  { name: "PaulHolt",      score: 99999999 },
  { name: "VeraSanchez",   score: 99999999 },
  { name: "RobDier",       score: 99999999 },
  { name: "PamRoberts",    score: 99999999 },
  { name: "SandraLiu",     score: 99999999 },
  { name: "BrentCarter",   score: 99999999 },
  { name: "MollyRaines",   score: 99999999 },
  { name: "LukeBowen",     score: 99999999 },
  { name: "ErinWalsh",     score: 99999999 },
  { name: "DerekMason",    score: 99999999 },
  { name: "OliviaPrice",   score: 99999999 },
  { name: "EvanKeller",    score: 99999999 },
  { name: "NinaFlores",    score: 99999999 },
  { name: "GrantNolan",    score: 99999999 },
  { name: "KeiraHolt",     score: 99999999 },
  { name: "MilesBoone",    score: 99999999 },
  { name: "TessaWard",     score: 99999999 },
  { name: "OwenCruz",      score: 99999999 },
  { name: "LanaPierce",    score: 99999999 },
  { name: "NoahRivers",    score: 99999999 },
  { name: "JadeFoster",    score: 99999999 },
  { name: "FelixReed",     score: 99999999 },
  { name: "MaraSutton",    score: 99999999 },
  { name: "CalebStone",    score: 99999999 },
  { name: "IvyGranger",    score: 99999999 },
  { name: "ZoeHolland",    score: 99999999 },
  { name: "HugoBennett",   score: 99999999 },
  { name: "LilaHart",      score: 99999999 },
  { name: "ParkerWest",    score: 99999999 },
  { name: "SloaneDay",     score: 99999999 },
  { name: "RoryJames",     score: 99999999 },
  { name: "ElenaVoss",     score: 99999999 },
  { name: "GavinShaw",     score: 99999999 },
  { name: "IrisCole",      score: 99999999 },
  { name: "MasonYork",     score: 99999999 },
  { name: "HarperFox",     score: 99999999 },
  { name: "DaisyLong",     score: 99999999 },
  { name: "QuinnFrost",    score: 99999999 },
  { name: "NoraBlake",     score: 99999999 },
  { name: "TheoDrake",     score: 99999999 },
  { name: "RubyParks",     score: 99999999 },
  { name: "EliStroud",     score: 99999999 },
  { name: "CoraLane",      score: 99999999 },
  { name: "FinnHarlow",    score: 99999999 },
  { name: "PennyKnox",     score: 99999999 },
  { name: "WyattBrooks",   score: 99999999 },
  { name: "MaeveHarper",   score: 99999999 },
  { name: "JasperWells",   score: 99999999 },
  { name: "AdaBrody",      score: 99999999 },
  { name: "ColtMurray",    score: 99999999 },
  { name: "VioletReese",   score: 99999999 },
  { name: "LeviParker",    score: 99999999 },
  { name: "NovaChase",     score: 99999999 },
  { name: "EdenSloane",    score: 99999999 },
  { name: "BlakeVega",     score: 99999999 },
  { name: "AriaMonroe",    score: 99999999 },
  { name: "JudeKessler",   score: 99999999 },
  { name: "SkyeBishop",    score: 99999999 },
  { name: "ReeseCaldwell", score: 99999999 },
  { name: "SawyerGriffin", score: 99999999 },
  { name: "HazelQuinn",    score: 99999999 },
  { name: "NolanPier",     score: 99999999 },
  { name: "SageMercer",    score: 99999999 },
  { name: "EmeryVaughn",   score: 99999999 },
  { name: "KaraNash",      score: 99999999 },
  { name: "BeckettHale",   score: 99999999 },
  { name: "AylaRowe",      score: 99999999 },
  { name: "PhoenixHart",   score: 99999999 },
  { name: "DylanRhodes",   score: 99999999 },
  { name: "CamdenVale",    score: 99999999 },
  { name: "RainaLocke",    score: 99999999 },
  { name: "KieranRowan",   score: 99999999 },
  { name: "LennonVale",    score: 99999999 },
  { name: "TaliaWren",     score: 99999999 },
  { name: "OrionSlate",    score: 99999999 },
  { name: "MiraWolfe",     score: 99999999 },
  { name: "DeclanChoi",    score: 99999999 },
  { name: "EliseRoy",      score: 99999999 },
  { name: "KnoxMarsh",     score: 99999999 },
  { name: "AveryBanks",    score: 99999999 },
  { name: "IonaSparks",    score: 99999999 },
  { name: "RowanLyne",     score: 99999999 },
  { name: "KaiMaddox",     score: 99999999 },
  { name: "NoelleFirth",   score: 99999999 },
  { name: "BriarKeene",    score: 99999999 },
  { name: "ZaneMercer",    score: 99999999 },
  { name: "FreyaCole",     score: 99999999 },
  { name: "AxelRidge",     score: 99999999 },
  { name: "IndieRowell",   score: 99999999 },
  { name: "KoriAsh",       score: 99999999 },
  { name: "JunoValen",     score: 99999999 },
  { name: "EliasOrtega",   score: 99999999 },
  { name: "MarisNoble",    score: 99999999 },
  { name: "SilasNorth",    score: 99999999 },
  { name: "TessHayden",    score: 99999999 }
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

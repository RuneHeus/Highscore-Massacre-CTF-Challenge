import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const app = express(); // NOSONAR
const prisma = new PrismaClient();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // NOSONAR - CORS intentionally enabled for local CTF / game setup
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; ")
  );
  next();
});

app.post("/score", async (req, res) => {
  try {
    const { name, score, gameId } = req.body;

    if (!name || typeof score !== "number" || !gameId) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // 1. Maak game session
    const session = await prisma.game_session.create({
      data: {
        game_id: gameId,
        start_time: new Date(),
        end_time: new Date(),
        final_score: score,
        time_played_seconds: 0,
        status: "finished",
        ip_address: req.ip
      }
    });

    // 2. Voeg leaderboard entry toe
    await prisma.leaderboard_entry.create({
      data: {
        game_id: gameId,
        session_id: session.session_id,
        player_name: name,
        score: score,
        rank_position: 0 // herberekend hieronder
      }
    });

    // 3. Herbereken ranking
    const entries = await prisma.leaderboard_entry.findMany({
      where: { game_id: gameId },
      orderBy: { score: "desc" }
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboard_entry.update({
        where: { entry_id: entries[i].entry_id },
        data: { rank_position: i + 1 }
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/leaderboard/:gameId", async (req, res) => {
  const gameId = Number(req.params.gameId);

  const leaderboard = await prisma.leaderboard_entry.findMany({
    where: { game_id: gameId },
    orderBy: { score: "desc" },
    take: 10
  });

  res.json(leaderboard);
});

const DIST_PATH = path.join(__dirname, "../dist");

app.use(express.static(DIST_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
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
  console.log("POST /score body:", req.body);
  try {
    const { name, score, gameId } = req.body;

    if (!name || typeof score !== "number" || !gameId) {
      return res.status(400).json({ error: "Invalid data" });
    }

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

    await prisma.leaderboard_entry.create({
      data: {
        game_id: gameId,
        session_id: session.session_id,
        player_name: name,
        score: score
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/leaderboard/:gameId", async (req, res) => {
  console.log("GET /leaderboard gameId:", req.params.gameId);
  const gameId = Number(req.params.gameId);

  const entries = await prisma.leaderboard_entry.findMany({
    where: { game_id: gameId },
    orderBy: { score: "desc" },
    take: 5
  });

  const leaderboard = entries.map((entry, index) => ({
    rank: index + 1,
    player_name: entry.player_name,
    score: entry.score,
    achieved_date: entry.achieved_date
  }));

  console.log("Leaderboard entries:", entries);

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
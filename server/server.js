import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
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

    if (score > 2147483647) {
      return res.status(400).json({ error: "Thats a bit to much, no? :D" });
    }

    // 1. Create session
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

    // 2. Save leaderboard entry
    await prisma.leaderboard_entry.create({
      data: {
        game_id: gameId,
        session_id: session.session_id,
        player_name: name,
        score: score
      }
    });

    // 3. Determine if THIS score is the highest on the leaderboard
    const topEntry = await prisma.leaderboard_entry.findFirst({
      where: { game_id: gameId },
      orderBy: { score: "desc" }
    });

    const isHighest = !topEntry || score >= topEntry.score;

    // 4. Respond (DO NOT update all_time_high_score here)
    res.json({
      success: true,
      isHighest,
      sessionId: session.session_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/ctf/claim", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const session = await prisma.game_session.findUnique({
      where: { session_id: sessionId }
    });
    if (!session) return res.status(404).json({ error: "Invalid session" });

    const game = await prisma.game.findUnique({
      where: { game_id: session.game_id }
    });

    //Je moet de hoogste score hebben om de vlag te krijgen
    if (session.final_score < game.all_time_high_score) {
      return res.status(403).json({ error: "Not eligible" });
    }

    return res.json({ flag: "CTF{Ki_kI_KI_Ma_MA_mA}" });
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
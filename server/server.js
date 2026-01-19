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
  try {
    const { name, score, gameId } = req.body;

    if (!name || typeof score !== "number" || !gameId) {
      return res.status(400).json({ error: "Invalid data" });
    }

    if (score > 2147483647) {
      return res.status(400).json({ error: "Thats a bit to much, no? :D" });
    }

    // Check if a session already exists for this IP and game
    let existingSession = await prisma.game_session.findFirst({
      where: {
        ip_address: req.ip,
        game_id: gameId
      }
    });

    let sessionId;

    if (existingSession) {
      // Update existing session
      await prisma.game_session.update({
        where: { session_id: existingSession.session_id },
        data: {
          end_time: new Date(),
          final_score: score,
          time_played_seconds: 0,
          status: "finished"
        }
      });

      // Update existing leaderboard entry
      await prisma.leaderboard_entry.update({
        where: { session_id: existingSession.session_id },
        data: {
          player_name: name,
          score: score,
          achieved_date: new Date()
        }
      });

      sessionId = existingSession.session_id;
    } else {
      // Create new session
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

      // Create new leaderboard entry
      await prisma.leaderboard_entry.create({
        data: {
          game_id: gameId,
          session_id: session.session_id,
          player_name: name,
          score: score
        }
      });

      sessionId = session.session_id;
    }

    // Determine if THIS score is the highest on the leaderboard
    const topEntry = await prisma.leaderboard_entry.findFirst({
      where: { game_id: gameId },
      orderBy: { score: "desc" }
    });

    const isHighest = !topEntry || score >= topEntry.score;

    // Respond
    res.json({
      success: true,
      isHighest,
      sessionId: sessionId,
      key: isHighest ? "CTF{Ki_kI_KI_Ma_MA_mA}" : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/leaderboard/:gameId", async (req, res) => {
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
    achieved_date: entry.achieved_date,
    session_id: entry.session_id
  }));

  res.json(leaderboard);
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../public", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

const DIST_PATH = path.join(__dirname, "../dist");

app.use(express.static(DIST_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
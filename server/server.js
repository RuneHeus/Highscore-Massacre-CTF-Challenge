import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const app = express();
app.disable("x-powered-by");
const prisma = new PrismaClient();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_LORE_ROOT = path.resolve(__dirname, "../public");
const SANDBOX_ALLOWED_ROOT = path.resolve(__dirname, "../sandbox");

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000"
]);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: false
}));

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
      sessionId: sessionId
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



const VIRTUAL_ROOTS = {
  public: PUBLIC_LORE_ROOT,
  sandbox: SANDBOX_ALLOWED_ROOT
};

app.get("/lore/book", (req, res) => {
  const virtualPath = (req.query.path || "").replace(/^\/+/, "");

  if (virtualPath === "") {
    const rootLinks = Object.keys(VIRTUAL_ROOTS)
      .map(name => `<li><a href="/lore/book?path=${name}/">${name}/</a></li>`)
      .join("");

    return res.send(renderPage("Archive Root", rootLinks));
  }

  const [rootName, ...rest] = virtualPath.split("/");

  const baseRoot = VIRTUAL_ROOTS[rootName];
  if (!baseRoot) {
    return res.status(403).send("The path collapses into darkness.");
  }

  const relativePath = rest.join("/");
  const resolvedPath = path.resolve(path.join(baseRoot, relativePath));

  if (!resolvedPath.startsWith(baseRoot)) {
    return res.status(403).send("The path collapses into darkness.");
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).send("Nothing remains here.");
  }

  const stat = fs.statSync(resolvedPath);

  // ---- DIRECTORY LISTING ----
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });

    const listItems = entries.map(entry => {
      const suffix = entry.isDirectory() ? "/" : "";
      const nextPath = `${rootName}/${relativePath ? relativePath + "/" : ""}${entry.name}`;
      return `<li><a href="/lore/book?path=${encodeURIComponent(nextPath)}">${entry.name}${suffix}</a></li>`;
    }).join("");

    return res.send(
      renderPage(
        `Index of /${rootName}/${relativePath}`,
        listItems || "<li>(empty)</li>"
      )
    );
  }

  // ---- FILE ----
  res.sendFile(resolvedPath);
});

// ---- SIMPLE HTML RENDERER ----
function renderPage(title, listItems) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { background:#000; color:#ccc; font-family: monospace; }
          a { color:#b30000; text-decoration:none; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <ul>${listItems}</ul>
        <p><a href="/lore/book">← root</a></p>
      </body>
    </html>
  `;
}

app.post("/claim-ctf", async (req, res) => {
  try {
    const { sessionId, gameId } = req.body;

    if (!sessionId || !gameId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Fetch this session's leaderboard entry
    const entry = await prisma.leaderboard_entry.findUnique({
      where: { session_id: sessionId }
    });

    if (!entry || entry.game_id !== gameId) {
      return res.status(403).json({ error: "Session not found" });
    }

    const topEntry = await prisma.leaderboard_entry.findFirst({
      where: { game_id: gameId },
      orderBy: { score: "desc" }
    });

    if (!topEntry) {
      return res.status(404).json({ error: "Leaderboard empty" });
    }

    // Check if THIS session is the top scorer
    if (topEntry.session_id !== sessionId) {
      return res.status(403).json({
        success: false,
        message: "You are not the chosen one."
      });
    }

    const CTF_KEY = "CTF{Ki_kI_KI_Ma_MA_mA}";

    res.json({
      success: true,
      flag: CTF_KEY
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const DIST_PATH = path.join(__dirname, "../dist");

app.use(express.static(DIST_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
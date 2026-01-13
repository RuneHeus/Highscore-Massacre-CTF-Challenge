const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

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

const SCORE_FILE = path.join(__dirname, "../scores.json");

function loadScores() {
  if (!fs.existsSync(SCORE_FILE)) return [];
  return JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
}

function saveScores(scores) {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
}

app.post("/score", (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const scores = loadScores();
  scores.push({ name, score, date: Date.now() });

  scores.sort((a, b) => b.score - a.score);
  saveScores(scores.slice(0, 10));

  res.json({ success: true });
});

app.get("/leaderboard", (req, res) => {
  res.json(loadScores());
});

const DIST_PATH = path.join(__dirname, "../dist");

app.use(express.static(DIST_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Pad naar opslag
const SCORE_FILE = "./scores.json";

// Helper: scores laden
function loadScores() {
  if (!fs.existsSync(SCORE_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(SCORE_FILE));
}

// Helper: scores opslaan
function saveScores(scores) {
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
}

// Score opslaan
app.post("/score", (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const scores = loadScores();

  scores.push({
    name,
    score,
    date: Date.now()
  });

  // Sorteer hoogste score eerst
  scores.sort((a, b) => b.score - a.score);

  // Beperk tot top 10
  saveScores(scores.slice(0, 10));

  res.json({ success: true });
});

// Leaderboard ophalen
app.get("/leaderboard", (req, res) => {
  const scores = loadScores();
  res.json(scores);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
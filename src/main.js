import "./style.css";
import { initGame } from "./game/game";

const canvas = document.getElementById("gameCanvas");
initGame(canvas);

const btn = document.getElementById("leaderboard-btn");
const modal = document.getElementById("leaderboard-modal");
const closeBtn = document.getElementById("close-leaderboard");
const list = document.getElementById("leaderboard-list");

btn.addEventListener("click", async () => {
  modal.classList.remove("hidden");
  await loadLeaderboard();
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

async function loadLeaderboard() {
  list.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("/leaderboard/1");
    const data = await res.json();

    const filtered = data.filter(e => e.score > 500);

    if (filtered.length === 0) {
      list.innerHTML = "<p>No survivors...</p>";
      return;
    }

    list.innerHTML = "";

    filtered.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-entry";
      row.innerHTML = `
        <span>#${index + 1} ${entry.player_name}</span>
        <span>${entry.score}</span>
      `;
      list.appendChild(row);
    });

  } catch {
    list.innerHTML = "<p>Error loading leaderboard</p>";
  }
}
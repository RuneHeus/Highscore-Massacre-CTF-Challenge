import "./style.css";
import { initGame } from "./game/game";

const canvas = document.getElementById("gameCanvas");
initGame(canvas);
const ctfBtn = document.getElementById("ctf-claim-btn");
let currentSessionId = null;
const btn = document.getElementById("leaderboard-btn");
const modal = document.getElementById("leaderboard-modal");
const closeBtn = document.getElementById("close-leaderboard");
const list = document.getElementById("leaderboard-list");

window.onScoreSubmitted = function (data) {
  console.log("onScoreSubmitted called:", data);

  currentSessionId = data.sessionId;
  ctfBtn.classList.remove("hidden");
};

btn.addEventListener("click", async () => {
  modal.classList.remove("hidden");
  await loadLeaderboard();
});

ctfBtn?.addEventListener("click", async () => {
  if (!currentSessionId) {
    alert("Nothing happens...");
    return;
  }

  try {
    const res = await fetch("/ctf/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: currentSessionId })
    });

    const data = await res.json();

    if (data.flag) {
      alert(data.flag);
    } else {
      alert("Nothing happens...");
    }
  } catch {
    alert("Nothing happens...");
  }
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

async function loadLeaderboard() {
  list.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("/leaderboard/1");
    const data = await res.json();

    if (data.length === 0) {
      list.innerHTML = "<p>No survivors...</p>";
      return;
    }

    list.innerHTML = "";

    data.forEach((entry, index) => {
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
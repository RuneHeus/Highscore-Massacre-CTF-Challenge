import "./style.css";
import { initGame } from "./game/game";

const canvas = document.getElementById("gameCanvas");
initGame(canvas);
const ctfBtn = document.getElementById("ctf-claim-btn");
let currentSessionId = localStorage.getItem("sessionId");
const btn = document.getElementById("leaderboard-btn");
const modal = document.getElementById("leaderboard-modal");
const closeBtn = document.getElementById("close-leaderboard");
const list = document.getElementById("leaderboard-list");

if (currentSessionId) {
  checkIfHighestScore();
}

window.onScoreSubmitted = function (data) {
  console.log("Score submission result:", data);
  currentSessionId = data.sessionId;
  localStorage.setItem("sessionId", data.sessionId);
  if (data.isHighest) {
    console.log("Removing hidden class from ctfBtn");
    ctfBtn.classList.remove("hidden");
  }
};

btn.addEventListener("click", async () => {
  modal.classList.remove("hidden");
  await loadLeaderboard();
});

ctfBtn?.addEventListener("click", () => {
  if (!currentSessionId) {
    alert("Nothing happens...");
    return;
  }

  alert("Well done! Take this key CTF{Ki_kI_KI_Ma_MA_mA} and enjoy the free book");

  window.location.href = "/lore/book?path=public/lore/mask_of_jason_manuscript_v.4.pdf";
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

async function checkIfHighestScore() {
  console.log("[DEBUG] checkIfHighestScore called");
  console.log("[DEBUG] currentSessionId:", currentSessionId);

  try {
    console.log("[DEBUG] Fetching /leaderboard/1");

    const res = await fetch("/leaderboard/1");
    console.log("[DEBUG] Fetch completed, status:", res.status);

    const data = await res.json();
    console.log("[DEBUG] Response JSON:", data);

    if (data.length > 0) {
      console.log("[DEBUG] Leaderboard length:", data.length);

      // Find the current session's entry
      const currentEntry = data.find(entry => entry.session_id == currentSessionId);
      console.log("[DEBUG] Current entry:", currentEntry);

      if (currentEntry) {
        const currentScore = currentEntry.score;
        console.log("[DEBUG] Current score:", currentScore);

        // Check if current score is the highest (or tied for highest)
        const isHighest = data.every(entry => entry.score <= currentScore);
        console.log("[DEBUG] isHighest result:", isHighest);

        if (isHighest) {
          console.log("[DEBUG] Current session has highest score, revealing CTF button");
          ctfBtn.classList.remove("hidden");
        } else {
          console.log("[DEBUG] Current session does NOT have highest score");
        }
      } else {
        console.log("[DEBUG] Current session not found in leaderboard");
      }
    } else {
      console.log("[DEBUG] Leaderboard is empty");
    }
  } catch (error) {
    console.error("[ERROR] Error checking highest score:", error);
  }
}

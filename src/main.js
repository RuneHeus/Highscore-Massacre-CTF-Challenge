import "./style.css";
import { initGame } from "./game/game";

const canvas = document.getElementById("gameCanvas");
initGame(canvas);
const ctfBtn = document.getElementById("ctf-claim-btn");
let currentSessionId = Number(localStorage.getItem("ctf_sessionId") || 0) || null;
const btn = document.getElementById("leaderboard-btn");
const modal = document.getElementById("leaderboard-modal");
const closeBtn = document.getElementById("close-leaderboard");
const list = document.getElementById("leaderboard-list");

if (currentSessionId) {
  await (async () => {
    try {
      const res = await fetch("/leaderboard/1");
      const data = await res.json();

      if (data.length > 0) {
        const currentEntry = data.find(
          entry => entry.session_id == currentSessionId
        );

        if (currentEntry) {
          const currentScore = currentEntry.score;

          if (currentScore > 9999999) {
            ctfBtn.classList.remove("hidden");
          }
        }
      }
    } catch (error) {
      // Silently fail - claim button won't show if error
    }
  })();
}

globalThis.onScoreSubmitted = function (data) {
  currentSessionId = data.sessionId;
  localStorage.setItem("ctf_sessionId", data.sessionId);
  if (data.canClaim) {
    ctfBtn.classList.remove("hidden");
  }
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
    const res = await fetch("/claim-ctf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: currentSessionId,
        gameId: 1
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("The lake remains silent...");
      return;
    }
    
    alert(`Well done! Take this key ${data.flag} and enjoy the free book`);

    window.open(
      "/lore/book?path=public/lore/mask_of_jason_manuscript_v.4.pdf",
      "_blank"
    );

  } catch (err) {
    alert("Something went wrong in the woods...");
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

    const MAX_ENTRIES = 100;
    const sorted = data
      .slice()
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

    const topEntries = sorted.slice(0, MAX_ENTRIES);
    const finalCounselor = sorted.find(
      entry => entry.player_name === "FinalCounselor"
    );
    const finalInTop = finalCounselor
      ? topEntries.some(entry => entry.session_id === finalCounselor.session_id)
      : false;

    const entriesToRender = finalCounselor && !finalInTop
      ? [...topEntries, finalCounselor]
      : topEntries;

    entriesToRender.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-entry";
      if (entry.player_name === "FinalCounselor") {
        row.classList.add("final-counselor");
      }
      row.innerHTML = `
        <span>#${entry.rank ?? index + 1} ${entry.player_name}</span>
        <span>${entry.score}</span>
      `;
      list.appendChild(row);
    });

  } catch {
    list.innerHTML = "<p>Error loading leaderboard</p>";
  }
}
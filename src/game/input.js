function handleSaveInput(e, state) {
  if (!state.showSaveOverlay) return false;

  if (e.key === "Escape") {
    state.showSaveOverlay = false;
    return true;
  }

  if (e.key === "Backspace") {
    state.playerName = state.playerName.slice(0, -1);
    return true;
  }

  if (e.key === "Enter") {
    submitScore(state);
    return true;
  }

  if (e.key.length === 1 && state.playerName.length < 10) {
    state.playerName += e.key.toUpperCase();
    return true;
  }

  return true;
}

async function submitScore(state) {
  const payload = {
    name: state.playerName,
    score: Math.floor(state.score),
    gameId: 1
  };

  try {
    const res = await fetch("/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success && globalThis.onScoreSubmitted) {
      globalThis.onScoreSubmitted(data);
    }

    state.showSaveOverlay = false;
    state.gameState = "gameover";
  } catch (err) {
    // Silently handle error
  }
}

export function setupInput(state, player, resetGame, scale) {
  let jumpHeld = false;
  let jumpHoldTime = 0;
  const JUMP_CONTROL_TIME = 90;
  const JUMP_VELOCITY = -900 * scale;
  const DROP_VELOCITY = -120;
  document.addEventListener("keydown", (e) => {

    if (state.showSaveOverlay) {
      const handled = handleSaveInput(e, state);
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    if (e.code === "Space") {
      if (state.gameState === "start") {
        resetGame();
        state.gameState = "running";
      } else if (state.gameState === "running") {
        if (player.grounded) {
          player.vy = JUMP_VELOCITY;
          player.grounded = false;
          player.jumping = true;
          player.reachedMinJump = false;
          player.jumpStartY = player.y;
          jumpHeld = true;
          jumpHoldTime = 0;
        }
      } else if (state.gameState === "gameover") {
        // spatie doet hier niks, R reset
      }
      e.preventDefault();
    }

    if (e.key === "r" || e.key === "R") {
      if (state.gameState === "gameover" && !state.showSaveOverlay) {
        resetGame();
        state.gameState = "running";
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      if (
        player.jumping &&
        player.reachedMinJump &&
        player.vy < DROP_VELOCITY
      ) {
        player.vy = DROP_VELOCITY;
      }
      jumpHeld = false;
      jumpHoldTime = 0;
    }
  });
}

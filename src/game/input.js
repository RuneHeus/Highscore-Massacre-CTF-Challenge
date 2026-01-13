export function setupInput(state, player, resetGame) {
  let jumpHeld = false;
  let jumpHoldTime = 0;
  const JUMP_CONTROL_TIME = 90;
  const JUMP_VELOCITY = -450;
  const DROP_VELOCITY = -120;

  document.addEventListener("keydown", (e) => {
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
      if (state.gameState === "gameover") {
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

import { state } from "./state";
import { createPlayer, updatePlayer, updatePlayerAnimation } from "./player";
import { spawnObstacle, updateObstacles } from "./obstacles";
import { setupInput } from "./input";
import { checkCollision } from "./collision";

import * as assets from "../assets";

import { drawGround, drawParallaxBackground } from "./render/backgroundRender";
import { drawPlayer } from "./render/playerRender";
import { drawObstacles } from "./render/obstacleRender";
import { drawUI } from "./render/uiRender";

export function initGame(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const ground = {
    y: canvas.height - 96,
    height: 96
  };

  const player = createPlayer(1.8, ground.y);

  // INPUT
  setupInput(state, player, resetGame);

  function resetGame() {
    state.score = 0;
    state.baseSpeed = 380;
    state.obstacles.length = 0;
    state.lastTime = 0;
    state.gameState = "running";

    player.y = ground.y - player.height;
    player.vy = 0;
    player.grounded = true;
    player.jumping = false;
    player.reachedMinJump = false;
  }

  function loop(timestamp) {
    if (state.lastTime === 0) {
      state.lastTime = timestamp;
      requestAnimationFrame(loop);
      return;
    }

    const deltaMs = timestamp - state.lastTime;
    state.lastTime = timestamp;

    const delta = deltaMs / 1000;

    if (state.gameState === "running") {
      updatePlayer(player, delta, ground, 1400);
      updatePlayerAnimation(player, delta);
      updateObstacles(state.obstacles, state.baseSpeed, delta, state, canvas.width, ground.y);

      for (const obs of state.obstacles) {
        if (checkCollision(player, obs)) {
          state.gameState = "gameover";
          break;
        }
      }

      state.score += delta * 10;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    }

    render(ctx, canvas, player, state, ground, delta);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function render(ctx, canvas, player, state, ground, delta) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawParallaxBackground(ctx, assets, canvas, state, delta);
  drawGround(ctx, assets, canvas, state, ground, delta);
  drawObstacles(ctx, assets, state.obstacles, delta);

  const frame = {
    col: player.frameIndex % 5,
    row: Math.floor(player.frameIndex / 5)
  };
  drawPlayer(ctx, assets, frame, player);
  drawUI(ctx, canvas, state, assets);
}

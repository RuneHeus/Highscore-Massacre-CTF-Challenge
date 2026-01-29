import { state } from "./state";
import { createPlayer, updatePlayer, updatePlayerAnimation } from "./player";
import { spawnObstacle, updateObstacles } from "./obstacles";
import { setupInput } from "./input";
import { checkCollision } from "./collision";

import * as assets from "../assets";

import { drawGround, drawParallaxBackground, drawJason } from "./render/backgroundRender";
import { drawPlayer } from "./render/playerRender";
import { drawObstacles } from "./render/obstacleRender";
import { drawUI } from "./render/uiRender";

export function initGame(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.gameState === "running") {
      state.gameState = "gameover";
      state.showSaveOverlay = false;
    }
  });

  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 400;

  let scale = 1;
  let ground = { y: 0, height: 0 };
  let player = null;

  function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.6;
    const aspectRatio = BASE_WIDTH / BASE_HEIGHT;

    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    // Update scale and recreate elements
    scale = canvas.width / BASE_WIDTH;
    ground = {
      y: canvas.height - 96 * scale,
      height: 96 * scale
    };

    if (player) {
      player.width = 80 * scale;
      player.height = 120 * scale;
      player.hbOffsetX = (player.width - 55 * scale) / 2;
      player.hbWidth = 55 * scale;
      player.hbHeight = 110 * scale;
      player.visualOffsetY = player.height - player.hbHeight;  // RECALCULATE THIS!
      player.x = canvas.width * 0.3125;
      player.y = ground.y - player.height + player.visualOffsetY;
    }

    // Scale existing obstacles
    state.obstacles.forEach(obs => {
      if (obs.type === "campfire") {
        obs.width = 150 * 0.45 * scale;
        obs.height = 120 * 0.45 * scale;
        obs.hbOffsetX = obs.width * 0.25;
        obs.hbOffsetY = obs.height * 0.20;
        obs.hbWidth = obs.width * 0.50;
        obs.hbHeight = obs.height * 0.80;
      } else if (obs.type === "tombstone") {
        obs.width = 48 * scale;
        obs.height = 80 * scale;
        obs.hbOffsetX = obs.width * 0.25;
        obs.hbOffsetY = obs.height * 0.20;
        obs.hbWidth = obs.width * 0.50;
        obs.hbHeight = obs.height * 0.80;
      }
      obs.y = ground.y - obs.height;
    });
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  player = createPlayer(scale, ground.y, canvas.width);

  // INPUT
  setupInput(state, player, resetGame, scale);

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
    drawJason(ctx, assets, canvas, player, ground, scale, delta);
    drawUI(ctx, canvas, state, assets, scale);
  }

  function resetGame() {
    state.score = 0;
    state.baseSpeed = 450 * scale;
    state.obstacles.length = 0;
    state.lastTime = 0;
    state.gameState = "running";

    player.y = ground.y - player.height + player.visualOffsetY;
    player.vy = 0;
    player.grounded = true;
    player.jumping = false;
    player.reachedMinJump = false;
  }

  function loop(timestamp) {
    // Always initialize lastTime safely
    if (state.lastTime === 0) {
      state.lastTime = timestamp;
      requestAnimationFrame(loop);
      return;
    }

    const deltaMs = timestamp - state.lastTime;
    state.lastTime = timestamp;

    const delta = deltaMs / 1000;

    if (state.gameState === "running") {
      state.baseSpeed += state.speedIncrease * delta;

      updatePlayer(player, delta, ground, 4000, scale);
      updatePlayerAnimation(player, delta);
      updateObstacles(
        state.obstacles,
        state.baseSpeed,
        delta,
        state,
        canvas.width,
        ground.y,
        scale
      );

      for (const obs of state.obstacles) {
        if (checkCollision(player, obs)) {
          state.gameState = "gameover";
          if (state.score >= 200) {
            state.showSaveOverlay = true;
          }
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
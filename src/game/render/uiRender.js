export function drawUI(ctx, canvas, state, assets, scale) {
  ctx.fillStyle = "#f5f5f5";
  ctx.font = `${20 * scale}px system-ui`;
  ctx.textAlign = "left";
  ctx.fillText("Score: " + Math.floor(state.score), 16 * scale, 32 * scale);

  ctx.fillStyle = "#ff5252";
  ctx.textAlign = "right";
  ctx.fillText(
    "Highscore: " + Math.floor(state.highScore),
    canvas.width - 16 * scale,
    32 * scale
  );

  if (state.gameState === "start") {
    drawStartScreen(ctx, canvas, assets, scale);
  }

  if (state.gameState === "gameover") {
    if (state.showSaveOverlay) { 
      console.log("Drawing save score screen");
      drawSaveScoreScreen(ctx, state, canvas, scale);
    } else {
      console.log("Drawing game over screen");
      drawGameOverScreen(ctx, state, canvas, scale);
    }
  }
}

function drawStartScreen(ctx, canvas, assets, scale) {
  // donkere overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // afbeelding centreren
  const imgWidth = 300 * scale;
  const imgHeight = 300 * scale;
  ctx.drawImage(assets.startImage, canvas.width/2 - imgWidth/2, canvas.height/2 - imgHeight/2 - 40 * scale, imgWidth, imgHeight);

  // titel
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `${32 * scale}px system-ui`;
  ctx.fillText("RUN FROM JASON", canvas.width/2, canvas.height/2 + 150 * scale);

  // instructies
  ctx.font = `${18 * scale}px system-ui`;
  ctx.fillText("Druk op SPATIE om te starten", canvas.width/2, canvas.height/2 + 185 * scale);
}

function drawGameOverScreen(ctx, state, canvas, scale) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ff5252";
  ctx.font = "32px system-ui";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px system-ui";
  ctx.fillText(
    "Score: " + Math.floor(state.score),
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.fillText(
    "Highscore: " + Math.floor(state.highScore),
    canvas.width / 2,
    canvas.height / 2 + 30
  );

  ctx.font = "18px system-ui";
  ctx.fillText(
    "Druk op R om opnieuw te spelen",
    canvas.width / 2,
    canvas.height / 2 + 70
  );
}

function drawSaveScoreScreen(ctx, state, canvas, scale) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const boxW = 360 * scale;
  const boxH = 260 * scale;
  const x = canvas.width / 2 - boxW / 2;
  const y = canvas.height / 2 - boxH / 2;

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 4 * scale;
  ctx.strokeRect(x, y, boxW, boxH);

  ctx.textAlign = "center";

  ctx.fillStyle = "#ff0000";
  ctx.font = `${28 * scale}px system-ui`;
  ctx.fillText("SAVE SCORE", canvas.width / 2, y + 40 * scale);

  ctx.fillStyle = "#ffffff";
  ctx.font = `${20 * scale}px system-ui`;
  ctx.fillText(
    `Score: ${Math.floor(state.score)}`,
    canvas.width / 2,
    y + 90 * scale
  );

  ctx.font = `${16 * scale}px system-ui`;
  ctx.fillText(
    "Typ je naam en druk op ENTER",
    canvas.width / 2,
    y + 140 * scale
  );

  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(
    canvas.width / 2 - 100 * scale,
    y + 160 * scale,
    200 * scale,
    30 * scale
  );

  ctx.fillText(
    state.playerName || "_",
    canvas.width / 2,
    y + 182 * scale
  );
}
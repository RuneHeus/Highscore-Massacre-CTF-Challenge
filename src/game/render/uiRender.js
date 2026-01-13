export function drawUI(ctx, canvas, state, assets) {
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "20px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + Math.floor(state.score), 16, 32);

  ctx.fillStyle = "#ff5252";
  ctx.textAlign = "right";
  ctx.fillText(
    "Highscore: " + Math.floor(state.highScore),
    canvas.width - 16,
    32
  );

  if (state.gameState === "start") {
    drawStartScreen(ctx, canvas, assets);
  }

  if (state.gameState === "gameover") {
    drawGameOverScreen(ctx, state, canvas);
  }
}

function drawStartScreen(ctx, canvas, assets) {
  // donkere overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // afbeelding centreren
  const imgWidth = 300;
  const imgHeight = 300;
  ctx.drawImage(assets.startImage, canvas.width/2 - imgWidth/2, canvas.height/2 - imgHeight/2 - 40, imgWidth, imgHeight);

  // titel
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "32px system-ui";
  ctx.fillText("RUN FROM JASON", canvas.width/2, canvas.height/2 + 150);

  // instructies
  ctx.font = "18px system-ui";
  ctx.fillText("Druk op SPATIE om te starten", canvas.width/2, canvas.height/2 + 185);
}

function drawGameOverScreen(ctx, state, canvas) {
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
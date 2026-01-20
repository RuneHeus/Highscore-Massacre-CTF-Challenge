const UI_FONT = "RetroPixel";

export async function drawUI(ctx, canvas, state, assets, scale) {
  await document.fonts.load(`${20 * scale}px ${UI_FONT}`);

  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#f5f5f5";
  ctx.font = `${20 * scale}px ${UI_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillText(
    "Score: " + Math.floor(state.score),
    16 * scale,
    16 * scale
  );

  ctx.fillStyle = "#ff5252";
  ctx.textAlign = "right";
  ctx.fillText(
    "Personal Highscore: " + Math.floor(state.highScore),
    canvas.width - 16 * scale,
    16 * scale
  );

  if (state.gameState === "start") {
    drawStartScreen(ctx, canvas, assets, scale);
  }

  if (state.gameState === "gameover") {
    if (state.showSaveOverlay) {
      drawSaveScoreScreen(ctx, state, canvas, scale);
    } else {
      drawGameOverScreen(ctx, state, canvas, scale);
    }
  }
}


function drawStartScreen(ctx, canvas, assets, scale) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "#ffffff";
  ctx.font = `${32 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "RUN FROM JASON",
    canvas.width / 2,
    canvas.height / 2 - 20 * scale
  );

  ctx.font = `${18 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "Press SPACE to start",
    canvas.width / 2,
    canvas.height / 2 + 20 * scale
  );
}

function drawGameOverScreen(ctx, state, canvas, scale) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";

  ctx.fillStyle = "#ff5252";
  ctx.font = `${32 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    canvas.height / 2 - 60 * scale
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = `${20 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "Score: " + Math.floor(state.score),
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.fillText(
    "Personal Highscore: " + Math.floor(state.highScore),
    canvas.width / 2,
    canvas.height / 2 + 28 * scale
  );

  ctx.font = `${18 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "Press R to restart",
    canvas.width / 2,
    canvas.height / 2 + 70 * scale
  );

  if (state.score < 200) {
    ctx.fillText(
      "get 200 or more score in order to save score",
      canvas.width / 2,
      canvas.height / 2 + 98 * scale
    );
  }
}

function drawSaveScoreScreen(ctx, state, canvas, scale) {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const boxW = 360 * scale;
  const boxH = 300 * scale; // iets hoger voor extra tekst
  const x = canvas.width / 2 - boxW / 2;
  const y = canvas.height / 2 - boxH / 2;

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 4 * scale;
  ctx.strokeRect(x, y, boxW, boxH);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Titel
  ctx.fillStyle = "#ff0000";
  ctx.font = `${28 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "SAVE SCORE",
    canvas.width / 2,
    y + 20 * scale
  );

  // Score
  ctx.fillStyle = "#ffffff";
  ctx.font = `${20 * scale}px ${UI_FONT}`;
  ctx.fillText(
    `Score: ${Math.floor(state.score)}`,
    canvas.width / 2,
    y + 70 * scale
  );

  // Instructie
  ctx.font = `${16 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "Type your name and press ENTER",
    canvas.width / 2,
    y + 115 * scale
  );

  // Input box
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(
    canvas.width / 2 - 100 * scale,
    y + 145 * scale,
    200 * scale,
    30 * scale
  );

  ctx.fillText(
    state.playerName || "_",
    canvas.width / 2,
    y + 152 * scale
  );

  ctx.fillStyle = "#aaaaaa";
  ctx.font = `${14 * scale}px ${UI_FONT}`;
  ctx.fillText(
    "Press ESC to cancel",
    canvas.width / 2,
    y + boxH - 28 * scale
  );
}
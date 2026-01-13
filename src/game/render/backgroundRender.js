export function drawGround(ctx, assets, canvas, state, ground, delta) {
  const sprite = assets.groundSprite;
  if (!sprite.complete || sprite.width === 0) return;

  if (state.gameState === "running") {
    const deltaSeconds = delta;
    state.groundOffsetX -= state.baseSpeed * deltaSeconds;
  }

  const spriteWidth = sprite.width;
  let drawX = Math.floor(state.groundOffsetX);

  if (drawX <= -spriteWidth) {
    state.groundOffsetX += spriteWidth;
    drawX += spriteWidth;
  }

  for (let x = drawX; x < canvas.width + spriteWidth; x += spriteWidth) {
    ctx.drawImage(
      sprite,
      x,
      ground.y,
      spriteWidth + 1,
      ground.height
    );
  }
}

export function drawParallaxBackground(ctx, assets, canvas, state, delta) {
  const sprite = assets.backgroundSprite;
  if (!sprite.complete || sprite.width === 0) return;

  if (state.gameState === "running") {
    const deltaSeconds = delta;
    state.backgroundOffsetX -= state.baseSpeed * 0.25 * deltaSeconds;
  }

  const spriteWidth = sprite.width;
  const spriteHeight = sprite.height;

  const scale = canvas.height / spriteHeight;
  const drawWidth = Math.ceil(spriteWidth * scale);

  state.backgroundOffsetX = Math.floor(state.backgroundOffsetX);

  if (state.backgroundOffsetX <= -drawWidth) {
    state.backgroundOffsetX += drawWidth;
  }

  for (let x = state.backgroundOffsetX; x < canvas.width + drawWidth; x += drawWidth) {
    ctx.drawImage(
      sprite,
      x,
      0,
      drawWidth + 1,
      canvas.height
    );
  }
}

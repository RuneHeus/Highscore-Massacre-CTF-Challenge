export function drawGround(ctx, assets, canvas, state, ground, delta) {
  const sprite = assets.groundSprite;
  if (!sprite.complete || sprite.width === 0) return;

  if (state.gameState === "running") {
    const deltaSeconds = delta;
    state.groundOffsetX -= state.baseSpeed * deltaSeconds;
  }

  const spriteWidth = sprite.width;
  const scale = ground.height / 96; // Assuming base ground height is 96
  const drawHeight = ground.height;

  let drawX = Math.floor(state.groundOffsetX);

  if (drawX <= -spriteWidth * scale) {
    state.groundOffsetX += spriteWidth * scale;
    drawX += spriteWidth * scale;
  }

  for (let x = drawX; x < canvas.width + spriteWidth * scale; x += spriteWidth * scale) {
    ctx.drawImage(
      sprite,
      x,
      ground.y,
      spriteWidth * scale + 1,
      drawHeight
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

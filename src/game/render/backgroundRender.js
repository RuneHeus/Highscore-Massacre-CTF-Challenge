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

export function drawJason(ctx, assets, canvas, player, ground, scale, delta) {
  const sprite = assets.jasonSprite;
  if (!sprite.complete || sprite.width === 0) return;

  const FRAMES = [
    { x:   0, y: 0, w: 77,  h: 109 },
    { x:  82, y: 0, w: 82,  h: 109 },
    { x: 184, y: 0, w: 82,  h: 109 },
    { x: 281, y: 0, w: 68,  h: 109 },
    { x: 356, y: 0, w: 72,  h: 109 },
    { x: 436, y: 0, w: 81,  h: 109 },
    { x: 527, y: 0, w: 81,  h: 109 },
  ];

  // Animation logic for Jason
  if (!drawJason.frameIndex) drawJason.frameIndex = 0;
  if (!drawJason.frameTimer) drawJason.frameTimer = 0;

  drawJason.frameTimer += delta * 1000; // delta is in seconds, convert to ms
  if (drawJason.frameTimer >= 100) {
    drawJason.frameIndex = (drawJason.frameIndex + 1) % FRAMES.length;
    drawJason.frameTimer = 0;
  }

  const frame = FRAMES[drawJason.frameIndex];

  const jasonWidth = frame.w * scale;
  const jasonHeight = frame.h * scale;
  const jasonX = player.x - jasonWidth - 50; // Position left of player with some offset
  const jasonY = ground.y - jasonHeight;

  ctx.drawImage(
    sprite,
    frame.x,
    frame.y,
    frame.w,
    frame.h,
    jasonX,
    jasonY,
    jasonWidth,
    jasonHeight
  );
}

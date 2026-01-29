export function createPlayer(scale, groundY, canvasWidth) {
  const height = 120 * scale;
  const width = 80 * scale;
  const hbWidth = 55 * scale;
  const hbHeight = 110 * scale;
  const visualOffsetY = height - hbHeight;
  const playerY = groundY - height;
  return {
    x: canvasWidth * 0.3125,
    y: groundY - height,
    width: width,
    height: height,
    // Hitbox voor nauwkeurige collision detection
    hbOffsetX: (width - hbWidth) / 2,  // Centreer horizontaal
    hbOffsetY: 0,  // Vanaf de bovenkant
    hbWidth: hbWidth,
    hbHeight: hbHeight,
    vy: 0,
    grounded: true,
    jumping: false,
    reachedMinJump: false,
    jumpStartY: 0,
    frameIndex: 0,
    frameTimer: 0,
    visualOffsetY: visualOffsetY,
  };
}

export function updatePlayerAnimation(player, delta) {
  player.frameTimer += delta * 1000;
  if (player.frameTimer >= 100) {
    player.frameIndex = (player.frameIndex + 1) % 7;
    player.frameTimer = 0;
  }

  return {
    col: player.frameIndex % 5,
    row: Math.floor(player.frameIndex / 5)
  };
}

export function updatePlayer(player, deltaSeconds, ground, gravity, scale) {
  const MIN_JUMP_HEIGHT = 60 * scale;
  const DROP_VELOCITY = -120;

  // Gravity (altijd, Dino-style)
  player.vy += gravity * deltaSeconds;

  // Positie
  player.y += player.vy * deltaSeconds;

  // Check minimale spronghoogte
  if (
    player.jumping &&
    !player.reachedMinJump &&
    player.jumpStartY - player.y >= MIN_JUMP_HEIGHT
  ) {
    player.reachedMinJump = true;
  }

  // Landing
  if (player.y + player.height - player.visualOffsetY >= ground.y) {
    player.y = ground.y - player.height + player.visualOffsetY;
    player.vy = 0;
    player.grounded = true;
    player.jumping = false;
  }
}

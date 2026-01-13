export function createPlayer(scale, groundY) {
  const height = 60 * scale;
  return {
    x: 80,
    y: groundY - height,
    width: 40 * scale,
    height: height,
    vy: 0,
    grounded: true,
    jumping: false,
    reachedMinJump: false,
    jumpStartY: 0,
    frameIndex: 0,
    frameTimer: 0,
  };
}

export function updatePlayerAnimation(player, delta) {
  player.frameTimer += delta * 1000; // delta is in seconds, convert to ms
  if (player.frameTimer >= 100) {
    player.frameIndex = (player.frameIndex + 1) % 7;
    player.frameTimer = 0;
  }

  return {
    col: player.frameIndex % 5,
    row: Math.floor(player.frameIndex / 5)
  };
}

export function updatePlayer(player, deltaSeconds, ground, gravity) {
  const MIN_JUMP_HEIGHT = 60;
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
  if (player.y + player.height >= ground.y) {
    player.y = ground.y - player.height;
    player.vy = 0;
    player.grounded = true;
    player.jumping = false;
  }

  // Positie update
  player.y += player.vy * deltaSeconds;

  if (player.y + player.height >= ground.y) {
    player.y = ground.y - player.height;
    player.vy = 0;
    player.grounded = true;
    player.jumping = false;
  }
}

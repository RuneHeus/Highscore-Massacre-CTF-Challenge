export function spawnObstacle(obstacles, width, groundY, scale = 1) {
  const isCampfire = Math.random() < 0.6; // NOSONAR - gameplay randomness, not security-related

  if (isCampfire) {
    const CAMPFIRE_FRAME_WIDTH = 150;
    const CAMPFIRE_FRAME_HEIGHT = 120;
    const CAMPFIRE_SCALE = 0.45 * scale;

    const w = CAMPFIRE_FRAME_WIDTH * CAMPFIRE_SCALE;
    const h = CAMPFIRE_FRAME_HEIGHT * CAMPFIRE_SCALE;

    obstacles.push({
      type: "campfire",
      x: width + 40 * scale,
      y: groundY - h,
      width: w,
      height: h,
      frame: 0,
      frameTimer: 0,
      //Hitbox
      hbOffsetX: w * 0.25,
      hbOffsetY: h * 0.20,
      hbWidth:   w * 0.50,
      hbHeight:  h * 0.80,
    });
  } else {
    const TOMBSTONE_WIDTH = 48 * scale;
    const TOMBSTONE_HEIGHT = 80 * scale;

    const w = TOMBSTONE_WIDTH;
    const h = TOMBSTONE_HEIGHT;

    obstacles.push({
      type: "tombstone",
      x: width + 40 * scale,
      y: groundY - h,
      width: w,
      height: h,
      //Hitbox
      hbOffsetX: w * 0.25,
      hbOffsetY: h * 0.20,
      hbWidth:   w * 0.50,
      hbHeight:  h * 0.80,
    });
  }
}

export function updateObstacles(obstacles, speed, deltaSeconds, state, canvasWidth, groundY, scale = 1) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    // Horizontale beweging (ook time-based)
    obs.x -= speed * deltaSeconds;

    // Verwijder buiten beeld
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      continue;
    }
  }

  state.distanceSinceLastObstacle += speed * deltaSeconds;

  if (state.distanceSinceLastObstacle >= state.obstacleDistance) {
    spawnObstacle(obstacles, canvasWidth, groundY, scale);
    state.distanceSinceLastObstacle = 0;
    state.obstacleDistance = (450 + Math.random() * 300) * scale; // NOSONAR - gameplay randomness, not security-related
  }
}

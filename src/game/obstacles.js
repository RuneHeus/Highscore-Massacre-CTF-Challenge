export function spawnObstacle(obstacles, width, groundY) {
  const isCampfire = Math.random() < 0.6;

  if (isCampfire) {
    const CAMPFIRE_FRAME_WIDTH = 150;
    const CAMPFIRE_FRAME_HEIGHT = 126;
    const CAMPFIRE_SCALE = 0.45;

    obstacles.push({
      type: "campfire",
      x: width + 40,
      y: groundY - CAMPFIRE_FRAME_HEIGHT * CAMPFIRE_SCALE,
      width: CAMPFIRE_FRAME_WIDTH * CAMPFIRE_SCALE,
      height: CAMPFIRE_FRAME_HEIGHT * CAMPFIRE_SCALE,
      frame: 0,
      frameTimer: 0,
    });
  } else {
    const TOMBSTONE_WIDTH = 48;
    const TOMBSTONE_HEIGHT = 80;

    const w = TOMBSTONE_WIDTH;
    const h = TOMBSTONE_HEIGHT;

    obstacles.push({
      type: "tombstone",
      x: width + 40,
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

export function updateObstacles(obstacles, speed, deltaSeconds, state, canvasWidth, groundY) {
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
    spawnObstacle(obstacles, canvasWidth, groundY);
    state.distanceSinceLastObstacle = 0;

    state.obstacleDistance = 450 + Math.random() * 300;
  }
}

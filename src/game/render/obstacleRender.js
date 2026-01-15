export function drawObstacles(ctx, assets, obstacles, delta) {
  obstacles.forEach((obs) => {
    if (obs.type === "campfire") {
      obs.frameTimer += delta * 1000; // delta is in seconds, convert to ms

      if (obs.frameTimer >= 120) {
        obs.frame = (obs.frame + 1) % 4;
        obs.frameTimer = 0;
      }

      ctx.drawImage(
        assets.campfireSprite,
        obs.frame * 150,
        0,
        150,
        126,
        Math.round(obs.x),
        Math.round(obs.y),
        obs.width,
        obs.height
      );
    }

    if (obs.type === "tombstone") {
      ctx.drawImage(
        assets.tombstoneSprite,
        Math.round(obs.x),
        Math.round(obs.y),
        obs.width,
        obs.height
      );
    }
  });
}

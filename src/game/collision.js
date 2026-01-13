export function checkCollision(a, b) {
  // Determine hitbox for a (player)
  let aX, aY, aWidth, aHeight;
  if (a.hbOffsetX !== undefined) {
    aX = a.x + a.hbOffsetX;
    aY = a.y + a.hbOffsetY;
    aWidth = a.hbWidth;
    aHeight = a.hbHeight;
  } else {
    aX = a.x;
    aY = a.y;
    aWidth = a.width;
    aHeight = a.height;
  }

  // Determine hitbox for b (obstacle)
  let bX, bY, bWidth, bHeight;
  if (b.hbOffsetX !== undefined) {
    bX = b.x + b.hbOffsetX;
    bY = b.y + b.hbOffsetY;
    bWidth = b.hbWidth;
    bHeight = b.hbHeight;
  } else {
    bX = b.x;
    bY = b.y;
    bWidth = b.width;
    bHeight = b.height;
  }

  return !(
    aX + aWidth < bX ||
    aX > bX + bWidth ||
    aY + aHeight < bY ||
    aY > bY + bHeight
  );
}

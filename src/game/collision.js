export function checkCollision(a, b) {
  if (b.type === "tombstone") {
    // Use hitbox for tombstones
    const hbX = b.x + b.hbOffsetX;
    const hbY = b.y + b.hbOffsetY;
    const hbWidth = b.hbWidth;
    const hbHeight = b.hbHeight;

    return !(
      a.x + a.width < hbX ||
      a.x > hbX + hbWidth ||
      a.y + a.height < hbY ||
      a.y > hbY + hbHeight
    );
  } else {
    // Default AABB for other obstacles
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }
}

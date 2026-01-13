export function drawPlayer(ctx, assets, frame, player) {
  ctx.drawImage(
    assets.playerSprite,
    frame.col * 150,
    frame.row * 150,
    150,
    150,
    player.x,
    player.y,
    player.width,
    player.height
  );
}
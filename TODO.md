# Fix Modular Game Issues

## 1. Update state.js
- Add missing variables: groundOffsetX, backgroundOffsetX, distanceSinceLastObstacle, obstacleDistance

## 2. Fix player.js
- Move frameIndex and frameTimer to player object in createPlayer
- Update updatePlayerAnimation to take player as parameter and return frame
- Update updatePlayer to include full jump logic (min jump height, variable jump)

## 3. Update obstacles.js
- Add distance tracking for spawning
- Add hitbox properties for tombstones

## 4. Update input.js
- Add full jump handling (keydown and keyup for variable jump)

## 5. Update game.js
- Fix function call parameters (drawGround, drawUI)
- Add parallax background rendering
- Fix obstacle updating (add spawning logic)
- Pass assets to drawUI

## 6. Update render files
- Fix parameter order in backgroundRender.js
- Add drawParallaxBackground in backgroundRender.js
- Update uiRender.js to draw start image

## 7. Update collision.js
- Handle hitboxes for tombstones

## 8. Test the game
- Run and verify all features work

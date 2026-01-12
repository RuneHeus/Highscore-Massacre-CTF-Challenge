const startImage = new Image();
startImage.src = "Media/startscreen.png";

const playerSprite = new Image();
playerSprite.src = "Media/player_run.png";

const campfireSprite = new Image();
campfireSprite.src = "Media/campfire.png";

const tombstoneSprite = new Image();
tombstoneSprite.src = "Media/tombstone.png";

const groundSprite = new Image();
groundSprite.src = "Media/ground.jpg";

let groundOffsetX = 0;

const backgroundSprite = new Image();
backgroundSprite.src = "Media/background.png";

let backgroundOffsetX = 0;

const PLAYER_SCALE = 1.8;

let distanceSinceLastObstacle = 0;
let obstacleDistance = 500;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  // GAME STATES
  let gameState = "start";

  // PLAYER
  const player = {
    x: 80,
    y: 0,
    width: 40 * PLAYER_SCALE,
    height: 60 * PLAYER_SCALE,
    vy: 0,
    grounded: false,
    jumping: false,
    reachedMinJump: false,
    jumpStartY: 0
  };

  const GRAVITY_UP = 900;
  const GRAVITY_DOWN = 600;

  const MAX_FALL_SPEED = 300;

  const CAMPFIRE_FRAMES = 4;
  const CAMPFIRE_FRAME_WIDTH = 150;
  const CAMPFIRE_FRAME_HEIGHT = 126;
  const CAMPFIRE_SCALE = 0.45;

  const TOMBSTONE_WIDTH = 48;
  const TOMBSTONE_HEIGHT = 80;

  const MIN_JUMP_TIME = 70;

  const APEX_GRAVITY_BOOST = 1400;
  const APEX_THRESHOLD = -40;

  // GROUND
  const ground = {
    y: height - 96,
    height: 96
  };

  // OBSTACLES (Jason)
  const obstacles = [];
  let baseSpeed = 380;
  let speedIncrease = 5;

  // SCORE
  let score = 0;
  let highScore = 0;

  let frameIndex = 0;
  let frameTimer = 0;
  const frameInterval = 100; // ms = snelheid van lopen

  const SPRITE_COLUMNS = 5;
  const SPRITE_ROWS = 2;
  const TOTAL_FRAMES = 7;

  const FRAME_WIDTH = 150;
  const FRAME_HEIGHT = 150;

  let jumpHeld = false;
  let jumpHoldTime = 0;

  const JUMP_CONTROL_TIME = 90;
  const GRAVITY_HOLD = 200;

  const JUMP_VELOCITY = -450;
  const GRAVITY = 1400;
  const DROP_VELOCITY = -120;
  const MIN_JUMP_HEIGHT = 60;


  // TIMING
  let lastTime = 0;
  let obstacleTimer = 0;
  let obstacleInterval = 3000; // ms

  function resetGame() {
    player.y = ground.y - player.height;
    player.vy = 0;
    player.grounded = true;
    obstacles.length = 0;
    score = 0;
    baseSpeed = 380;
    obstacleTimer = 0;
  }

  function spawnObstacle() {
    const isCampfire = Math.random() < 0.6;

    if (isCampfire) {
      obstacles.push({
        type: "campfire",
        x: width + 40,
        y: ground.y - CAMPFIRE_FRAME_HEIGHT * CAMPFIRE_SCALE,
        width: CAMPFIRE_FRAME_WIDTH * CAMPFIRE_SCALE,
        height: CAMPFIRE_FRAME_HEIGHT * CAMPFIRE_SCALE,
        frame: 0,
        frameTimer: 0,
      });
    } else {
      const w = TOMBSTONE_WIDTH;
      const h = TOMBSTONE_HEIGHT;

      obstacles.push({
        type: "tombstone",
        x: width + 40,
        y: ground.y - h,
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

  function update(delta) {
    if (gameState !== "running") return;

    // Tijd in seconden
    const deltaSeconds = delta / 1000;

    // Score & snelheid
    score += deltaSeconds * 10;
    baseSpeed += speedIncrease * deltaSeconds;

    // Gravity (altijd, Dino-style)
    player.vy += GRAVITY * deltaSeconds;

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
      jumpHeld = false;
      jumpHoldTime = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];

      // Horizontale beweging (ook time-based)
      obs.x -= baseSpeed * deltaSeconds;

      // Verwijder buiten beeld
      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
        continue;
      }

      // Collision
      if (checkCollision(player, obs)) {
        handleGameOver();
        return;
      }
    }

    distanceSinceLastObstacle += baseSpeed * deltaSeconds;

    if (distanceSinceLastObstacle >= obstacleDistance) {
      spawnObstacle();
      distanceSinceLastObstacle = 0;

      obstacleDistance = 450 + Math.random() * 300;
    }

    if (score > highScore) {
      highScore = score;
    }
  }

  function checkCollision(a, b) {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }

  function handleGameOver() {
    gameState = "gameover";
  }

  function drawBackground(delta) {
    if (!groundSprite.complete || groundSprite.width === 0) return;

    if (gameState !== "running") {
      // Alleen tekenen, NIET bewegen
      const spriteWidth = groundSprite.width;
      for (let x = groundOffsetX; x < width; x += spriteWidth) {
        ctx.drawImage(
          groundSprite,
          x,
          ground.y,
          spriteWidth,
          ground.height
        );
      }
      return;
    }
    
    const deltaSeconds = delta / 1000;

    groundOffsetX -= baseSpeed * deltaSeconds;

    const spriteWidth = groundSprite.width;

    if (groundOffsetX <= -spriteWidth) {
      groundOffsetX += spriteWidth;
    }

    for (let x = groundOffsetX; x < width; x += spriteWidth) {
      ctx.drawImage(
        groundSprite,
        x,
        ground.y,
        spriteWidth,
        ground.height
      );
    }
  }

  function drawParallaxBackground(delta) {
    if (!backgroundSprite.complete || backgroundSprite.width === 0) return;

    if (gameState === "running") {
      const deltaSeconds = delta / 1000;

      // Langzamer dan ground (parallax)
      backgroundOffsetX -= baseSpeed * 0.25 * deltaSeconds;
    }

    const spriteWidth = backgroundSprite.width;
    const spriteHeight = backgroundSprite.height;

    // Verticaal schalen naar canvas hoogte
    const scaleY = height / spriteHeight;
    const drawWidth = spriteWidth * scaleY;

    if (backgroundOffsetX <= -drawWidth) {
      backgroundOffsetX += drawWidth;
    }

    for (let x = backgroundOffsetX; x < width; x += drawWidth) {
      ctx.drawImage(
        backgroundSprite,
        x,
        0,
        drawWidth,
        height
      );
    }
  }

  function drawPlayer(delta) {
    frameTimer += delta;

    if (frameTimer >= frameInterval) {
      frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
      frameTimer = 0;
    }

    const col = frameIndex % SPRITE_COLUMNS;
    const row = Math.floor(frameIndex / SPRITE_COLUMNS);

    ctx.drawImage(
      playerSprite,
      col * FRAME_WIDTH,
      row * FRAME_HEIGHT,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }


  function drawObstacles(delta) {
    obstacles.forEach((obs) => {
      if (obs.type === "campfire") {
        obs.frameTimer += delta;

        if (obs.frameTimer >= 120) {
          obs.frame = (obs.frame + 1) % CAMPFIRE_FRAMES;
          obs.frameTimer = 0;
        }

        ctx.drawImage(
          campfireSprite,
          obs.frame * CAMPFIRE_FRAME_WIDTH,
          0,
          CAMPFIRE_FRAME_WIDTH,
          CAMPFIRE_FRAME_HEIGHT,
          Math.round(obs.x),
          Math.round(obs.y),
          obs.width,
          obs.height
        );
      }
      else if (obs.type === "tombstone") {
        ctx.drawImage(
          tombstoneSprite,
          Math.round(obs.x),
          Math.round(obs.y),
          obs.width,
          obs.height
        );
      }
    });
  }

  function drawScore() {
    ctx.fillStyle = "#f5f5f5";
    ctx.font = "20px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + Math.floor(score), 16, 32);

    ctx.fillStyle = "#ff5252";
    ctx.textAlign = "right";
    ctx.fillText("Highscore: " + Math.floor(highScore), width - 16, 32);
  }

  function drawStartScreen() {
    // donkere overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, width, height);

    // afbeelding centreren
    const imgWidth = 300;
    const imgHeight = 300;
    ctx.drawImage(startImage, width/2 - imgWidth/2, height/2 - imgHeight/2 - 40, imgWidth, imgHeight);

    // titel
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "32px system-ui";
    ctx.fillText("RUN FROM JASON", width/2, height/2 + 150);

    // instructies
    ctx.font = "18px system-ui";
    ctx.fillText("Druk op SPATIE om te starten", width/2, height/2 + 185);
}


  function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ff5252";
    ctx.font = "32px system-ui";
    ctx.fillText("GAME OVER", width / 2, height / 2 - 40);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px system-ui";
    ctx.fillText("Score: " + Math.floor(score), width / 2, height / 2);
    ctx.fillText("Highscore: " + Math.floor(highScore), width / 2, height / 2 + 30);

    ctx.font = "18px system-ui";
    ctx.fillText("Druk op R om opnieuw te spelen", width / 2, height / 2 + 70);
  }

  function draw(delta) {
    ctx.clearRect(0, 0, width, height);

    drawParallaxBackground(delta);
    drawBackground(delta);
    drawPlayer(delta);
    drawObstacles(delta);
    drawScore();

    if (gameState === "start") {
      drawStartScreen();
    } else if (gameState === "gameover") {
      drawGameOverScreen();
    }
  }

  function gameLoop(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    update(delta);
    draw(delta);

    requestAnimationFrame(gameLoop);
  }

  // INPUT
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (gameState === "start") {
        resetGame();
        gameState = "running";
      } else if (gameState === "running") {
        if (player.grounded) {
          player.vy = JUMP_VELOCITY;
          player.grounded = false;
          player.jumping = true;
          player.reachedMinJump = false;
          player.jumpStartY = player.y;
        }
      } else if (gameState === "gameover") {
        // spatie doet hier niks, R reset
      }
      e.preventDefault();
    }

    if (e.key === "r" || e.key === "R") {
      if (gameState === "gameover") {
        resetGame();
        gameState = "running";
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      if (
        player.jumping &&
        player.reachedMinJump &&
        player.vy < DROP_VELOCITY
      ) {
        player.vy = DROP_VELOCITY;
      }
    }
  });


  // Init
  resetGame();
  requestAnimationFrame(gameLoop);
});

async function submitScore(name, score) {
  await fetch("http://localhost:3000/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, score })
  });
}
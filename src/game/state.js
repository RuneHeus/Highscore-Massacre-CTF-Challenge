export const state = {
  gameState: "start",
  score: 0,
  highScore: 0,
  baseSpeed: 450,
  speedIncrease: 15,
  lastTime: 0,
  obstacles: [],
  groundOffsetX: 0,
  backgroundOffsetX: 0,
  distanceSinceLastObstacle: 0,
  obstacleDistance: 500,
  showSaveOverlay: false,
  playerName: "",
  isHighest: false,
  ctfKey: null
};

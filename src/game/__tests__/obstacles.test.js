import { describe, it, expect, beforeEach } from "vitest";
import { spawnObstacle, updateObstacles } from "../obstacles";

describe("Obstacles", () => {
  let obstacles;
  const scale = 1;
  const groundY = 300;
  const canvasWidth = 800;

  beforeEach(() => {
    obstacles = [];
  });

  describe("spawnObstacle", () => {
    it("should spawn a campfire obstacle", () => {
      spawnObstacle(obstacles, canvasWidth, groundY, scale);

      expect(obstacles.length).toBeGreaterThan(0);
      const obstacle = obstacles[0];
      expect(["campfire", "tombstone"]).toContain(obstacle.type);
      expect(obstacle.x).toBe(canvasWidth + 40);
      expect(obstacle.y).toBeLessThan(groundY);
      expect(obstacle.width).toBeGreaterThan(0);
      expect(obstacle.height).toBeGreaterThan(0);
    });

    it("should have hitbox properties", () => {
      spawnObstacle(obstacles, canvasWidth, groundY, scale);

      const obstacle = obstacles[0];
      expect(obstacle.hbOffsetX).toBeGreaterThanOrEqual(0);
      expect(obstacle.hbOffsetY).toBeGreaterThanOrEqual(0);
      expect(obstacle.hbWidth).toBeGreaterThan(0);
      expect(obstacle.hbHeight).toBeGreaterThan(0);
    });

    it("should scale obstacles correctly", () => {
      const scale2 = 2;
      spawnObstacle(obstacles, canvasWidth, groundY, scale2);

      const obstacle = obstacles[0];
      if (obstacle.type === "campfire") {
        expect(obstacle.width).toBeCloseTo(150 * 0.45 * scale2, 1);
      } else {
        expect(obstacle.width).toBeCloseTo(48 * scale2, 1);
      }
    });
  });

  describe("updateObstacles", () => {
    it("should move obstacles left based on speed", () => {
      spawnObstacle(obstacles, canvasWidth, groundY, scale);
      const initialX = obstacles[0].x;
      const speed = 450;
      const delta = 0.016;
      const state = { distanceSinceLastObstacle: 0, obstacleDistance: 500 };

      updateObstacles(obstacles, speed, delta, state, canvasWidth, groundY, scale);

      expect(obstacles[0].x).toBeLessThan(initialX);
    });

    it("should remove obstacles that go off screen", () => {
      spawnObstacle(obstacles, canvasWidth, groundY, scale);
      obstacles[0].x = -100;
      const speed = 450;
      const delta = 0.016;
      const state = { distanceSinceLastObstacle: 0, obstacleDistance: 500 };

      updateObstacles(obstacles, speed, delta, state, canvasWidth, groundY, scale);

      expect(obstacles.length).toBe(0);
    });

    it("should spawn new obstacle when distance threshold is reached", () => {
      const speed = 450;
      const delta = 1.2; // Large delta to trigger spawn
      const state = { distanceSinceLastObstacle: 0, obstacleDistance: 500 };

      updateObstacles(obstacles, speed, delta, state, canvasWidth, groundY, scale);

      expect(obstacles.length).toBeGreaterThan(0);
    });

    it("should track distance since last obstacle", () => {
      const speed = 450;
      const delta = 0.016;
      const state = { distanceSinceLastObstacle: 0, obstacleDistance: 500 };

      updateObstacles(obstacles, speed, delta, state, canvasWidth, groundY, scale);

      expect(state.distanceSinceLastObstacle).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect } from "vitest";
import { state } from "../state";

describe("Game State", () => {
  it("should have correct initial values", () => {
    expect(state.gameState).toBe("start");
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(0);
    expect(state.baseSpeed).toBe(450);
    expect(state.obstacles).toEqual([]);
    expect(state.showSaveOverlay).toBe(false);
    expect(state.playerName).toBe("");
    expect(state.isHighest).toBe(false);
  });

  it("should have obstacle tracking properties", () => {
    expect(state).toHaveProperty("distanceSinceLastObstacle");
    expect(state).toHaveProperty("obstacleDistance");
    expect(state).toHaveProperty("groundOffsetX");
    expect(state).toHaveProperty("backgroundOffsetX");
  });

  it("should track timing", () => {
    expect(state).toHaveProperty("lastTime");
    expect(typeof state.lastTime).toBe("number");
  });
});

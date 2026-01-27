import { describe, it, expect } from "vitest";
import { checkCollision } from "../collision";

describe("Collision Detection", () => {
  it("should detect collision between overlapping rectangles", () => {
    const player = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    const obstacle = {
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    expect(checkCollision(player, obstacle)).toBe(true);
  });

  it("should not detect collision when objects are separated", () => {
    const player = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    const obstacle = {
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    expect(checkCollision(player, obstacle)).toBe(false);
  });

  it("should detect collision with hitbox offset", () => {
    const player = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      hbOffsetX: 25,
      hbOffsetY: 25,
      hbWidth: 50,
      hbHeight: 50
    };

    const obstacle = {
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    expect(checkCollision(player, obstacle)).toBe(true);
  });

  it("should detect collision when touching edge", () => {
    const player = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    const obstacle = {
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      hbOffsetX: 0,
      hbOffsetY: 0,
      hbWidth: 50,
      hbHeight: 50
    };

    expect(checkCollision(player, obstacle)).toBe(true);
  });
});

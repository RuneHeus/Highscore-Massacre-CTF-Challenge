import { describe, it, expect, beforeEach } from "vitest";
import { createPlayer, updatePlayer, updatePlayerAnimation } from "../player";

describe("Player", () => {
  let player;
  const scale = 1;
  const groundY = 300;
  const canvasWidth = 800;

  beforeEach(() => {
    player = createPlayer(scale, groundY, canvasWidth);
  });

  describe("createPlayer", () => {
    it("should create a player with correct initial properties", () => {
      expect(player.x).toBe(canvasWidth * 0.3125);
      expect(player.y).toBe(groundY - player.height);
      expect(player.width).toBe(80);
      expect(player.height).toBe(120);
      expect(player.vy).toBe(0);
      expect(player.grounded).toBe(true);
      expect(player.jumping).toBe(false);
    });

    it("should have correct hitbox dimensions", () => {
      expect(player.hbWidth).toBe(55);
      expect(player.hbHeight).toBe(110);
      expect(player.hbOffsetX).toBeCloseTo((player.width - 55) / 2);
    });

    it("should create player at correct canvas position", () => {
      expect(player.x).toBe(250);
    });
  });

  describe("updatePlayer", () => {
    it("should apply gravity when falling", () => {
      player.grounded = false;
      const gravity = 3500;
      const delta = 0.016;

      updatePlayer(player, delta, { y: 300, height: 0 }, gravity, scale);

      expect(player.vy).toBeGreaterThan(0);
    });

    it("should land player when reaching ground", () => {
      player.y = 280;
      player.vy = 500;
      player.grounded = false;
      const gravity = 3500;
      const delta = 0.016;
      const ground = { y: 300, height: 96 };

      updatePlayer(player, delta, ground, gravity, scale);

      expect(player.grounded).toBe(true);
      expect(player.vy).toBe(0);
    });

    it("should detect minimum jump height reached", () => {
      player.jumping = true;
      player.reachedMinJump = false;
      player.jumpStartY = 100;
      player.y = 30; // 70 pixels jumped
      const gravity = 3500;
      const delta = 0.016;
      const ground = { y: 300, height: 96 };

      updatePlayer(player, delta, ground, gravity, scale);

      expect(player.reachedMinJump).toBe(true);
    });
  });

  describe("updatePlayerAnimation", () => {
    it("should cycle through animation frames", () => {
      player.frameIndex = 0;
      player.frameTimer = 0;

      const frame1 = updatePlayerAnimation(player, 0.05);
      expect(frame1.col).toBe(0);

      player.frameTimer = 0.15;
      const frame2 = updatePlayerAnimation(player, 0.05);
      expect(frame2.col).toBeGreaterThanOrEqual(0);
    });

    it("should wrap frame index at max frames", () => {
      player.frameIndex = 6;
      player.frameTimer = 0;

      updatePlayerAnimation(player, 0.15); // 0.15 * 1000 = 150ms, triggers frame increment
      expect(player.frameIndex).toBe(0); // (6 + 1) % 7 = 0
    });
  });
});

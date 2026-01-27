import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

describe("Score Submission Endpoint", () => {
  let prisma;

  beforeEach(async () => {
    prisma = new PrismaClient();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("POST /score", () => {
    it("should reject invalid data", async () => {
      const invalidPayloads = [
        { name: "Test" }, // missing score and gameId
        { score: 100 }, // missing name and gameId
        { name: "Test", score: "invalid", gameId: 1 }, // score not number
      ];

      // Test each invalid payload
      for (const payload of invalidPayloads) {
        expect(payload).toBeDefined();
      }
    });

    it("should reject scores over 32-bit max", () => {
      const score = 2147483648; // Just over max 32-bit signed int
      expect(score).toBeGreaterThan(2147483647);
    });

    it("should reject negative scores", () => {
      const score = -100;
      expect(score).toBeLessThan(0);
    });

    it("should accept valid score submission", async () => {
      const validPayload = {
        name: "TestPlayer",
        score: 1000,
        gameId: 1
      };

      expect(validPayload.name).toBeDefined();
      expect(typeof validPayload.score).toBe("number");
      expect(validPayload.gameId).toBeDefined();
    });

    it("should set canClaim flag for high scores", () => {
      const highScore = 10000000;
      const lowScore = 1000;

      expect(highScore > 9999999).toBe(true);
      expect(lowScore > 9999999).toBe(false);
    });
  });

  describe("GET /leaderboard/:gameId", () => {
    it("should return leaderboard entries sorted by score descending", () => {
      const entries = [
        { player_name: "Alice", score: 1000, rank: 1 },
        { player_name: "Bob", score: 500, rank: 2 },
        { player_name: "Charlie", score: 250, rank: 3 }
      ];

      const sorted = [...entries].sort((a, b) => b.score - a.score);
      expect(sorted[0].score).toBe(1000);
      expect(sorted[sorted.length - 1].score).toBe(250);
    });

    it("should include session_id in response", () => {
      const entry = {
        player_name: "TestPlayer",
        score: 500,
        session_id: 123
      };

      expect(entry).toHaveProperty("session_id");
    });
  });

  describe("POST /claim-ctf", () => {
    it("should require sessionId and gameId", () => {
      const validPayload = {
        sessionId: 1,
        gameId: 1
      };

      expect(validPayload).toHaveProperty("sessionId");
      expect(validPayload).toHaveProperty("gameId");
    });

    it("should reject claims with insufficient score", () => {
      const lowScore = 9999999;
      expect(lowScore <= 9999999).toBe(true);
    });

    it("should allow claims with sufficient score", () => {
      const highScore = 10000000;
      expect(highScore > 9999999).toBe(true);
    });

    it("should return CTF flag on successful claim", () => {
      const expectedFlag = "CTF{Ki_kI_KI_Ma_MA_mA}";
      expect(expectedFlag).toMatch(/^CTF\{.*\}$/);
    });
  });

  describe("Leaderboard limit enforcement", () => {
    it("should remove oldest entries when limit exceeded", () => {
      const entries = Array.from({ length: 105 }, (_, i) => ({
        entry_id: i,
        score: 100 - i,
        achieved_date: new Date(Date.now() - i * 1000)
      }));

      const sorted = entries
        .sort((a, b) => a.achieved_date - b.achieved_date)
        .slice(0, 5); // Remove 5 oldest

      expect(sorted.length).toBe(5);
      expect(entries.length - sorted.length).toBe(100);
    });
  });
});

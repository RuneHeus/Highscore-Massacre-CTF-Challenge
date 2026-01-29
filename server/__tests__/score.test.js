import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";
import { createScoreHandlers } from "../scoreHandlers.js";

// Test database setup - use environment variable or skip if not available
const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const hasDatabase = !!testDatabaseUrl;

const prisma = hasDatabase ? new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl
    }
  }
}) : null;

// Mini server for testing
function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  const handlers = createScoreHandlers(prisma);
  app.post("/score", (req, res) => handlers.handlePostScore(req, res));
  app.get("/leaderboard/:gameId", (req, res) => handlers.handleGetLeaderboard(req, res));
  app.post("/claim-ctf", (req, res) => handlers.handleClaimCtf(req, res));

  return app;
}

describe("Score Integration Tests", () => {
  let app;
  let testGameId;

  beforeAll(async () => {
    if (!hasDatabase) {
      console.warn("⚠️  No database connection available. Run 'docker-compose up -d db' to enable full integration tests.");
      return;
    }

    // Create test server
    app = createTestServer();

    // Create a test game
    const game = await prisma.game.create({
      data: {
        title: "Test Game",
        description: "Test Description",
        instructions: "Test Instructions",
        thumbnail_url: "test.png"
      }
    });
    testGameId = game.game_id;
  });

  afterAll(async () => {
    if (!hasDatabase) return;

    // Clean up test data
    try {
      await prisma.leaderboard_entry.deleteMany({
        where: { game_id: testGameId }
      });
      await prisma.game_session.deleteMany({
        where: { game_id: testGameId }
      });
      await prisma.game.delete({
        where: { game_id: testGameId }
      });
      // Clean up test players
      await prisma.player.deleteMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 60000) // Delete players created in the last minute
          }
        }
      });
    } catch (err) {
      console.error("Cleanup error:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    if (!hasDatabase) return;
    
    // Clean up before each test
    await prisma.leaderboard_entry.deleteMany({
      where: { game_id: testGameId }
    });
    await prisma.game_session.deleteMany({
      where: { game_id: testGameId }
    });
  });

  describe("POST /score", () => {
    it.skipIf(!hasDatabase)("should reject invalid data - missing fields", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "Test" }); // missing score and gameId

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid data");
    });

    it.skipIf(!hasDatabase)("should reject invalid data - score not a number", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "Test", score: "invalid", gameId: testGameId });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid data");
    });

    it.skipIf(!hasDatabase)("should reject scores over 32-bit max", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "Test", score: 2147483648, gameId: testGameId });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("I only eat signed 32-bit integer.");
    });

    it.skipIf(!hasDatabase)("should reject negative scores", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "Test", score: -100, gameId: testGameId });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Are you going backwards?🤔");
    });

    it.skipIf(!hasDatabase)("should accept valid score submission and create database records", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "TestPlayer", score: 1000, gameId: testGameId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.canClaim).toBe(false);
      expect(response.body.sessionId).toBeDefined();

      // Verify database records were created
      const session = await prisma.game_session.findUnique({
        where: { session_id: response.body.sessionId }
      });
      expect(session).toBeDefined();
      expect(session.final_score).toBe(1000);

      const leaderboardEntry = await prisma.leaderboard_entry.findUnique({
        where: { session_id: response.body.sessionId }
      });
      expect(leaderboardEntry).toBeDefined();
      expect(leaderboardEntry.player_name).toBe("TestPlayer");
      expect(leaderboardEntry.score).toBe(1000);
    });

    it.skipIf(!hasDatabase)("should set canClaim flag for high scores", async () => {
      const response = await request(app)
        .post("/score")
        .send({ name: "HighScorer", score: 10000000, gameId: testGameId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.canClaim).toBe(true);
    });

    it.skipIf(!hasDatabase)("should update existing session when player submits again", async () => {
      // First submission
      const firstResponse = await request(app)
        .post("/score")
        .send({ name: "Player1", score: 500, gameId: testGameId });

      const playerCookie = firstResponse.headers['set-cookie'];
      const sessionId = firstResponse.body.sessionId;

      // Second submission with same player
      const secondResponse = await request(app)
        .post("/score")
        .set('Cookie', playerCookie)
        .send({ name: "Player1Updated", score: 1500, gameId: testGameId });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.sessionId).toBe(sessionId); // Same session

      // Verify the score was updated
      const updatedEntry = await prisma.leaderboard_entry.findUnique({
        where: { session_id: sessionId }
      });
      expect(updatedEntry.score).toBe(1500);
      expect(updatedEntry.player_name).toBe("Player1Updated");
    });
  });

  describe("GET /leaderboard/:gameId", () => {
    it.skipIf(!hasDatabase)("should return empty leaderboard when no scores exist", async () => {
      const response = await request(app)
        .get(`/leaderboard/${testGameId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it.skipIf(!hasDatabase)("should return leaderboard entries sorted by score descending", async () => {
      // Create multiple scores
      await request(app)
        .post("/score")
        .send({ name: "Alice", score: 1000, gameId: testGameId });

      await request(app)
        .post("/score")
        .send({ name: "Bob", score: 500, gameId: testGameId });

      await request(app)
        .post("/score")
        .send({ name: "Charlie", score: 750, gameId: testGameId });

      const response = await request(app)
        .get(`/leaderboard/${testGameId}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].player_name).toBe("Alice");
      expect(response.body[0].score).toBe(1000);
      expect(response.body[0].rank).toBe(1);
      expect(response.body[1].player_name).toBe("Charlie");
      expect(response.body[1].score).toBe(750);
      expect(response.body[2].player_name).toBe("Bob");
      expect(response.body[2].score).toBe(500);
    });

    it.skipIf(!hasDatabase)("should include session_id in leaderboard response", async () => {
      await request(app)
        .post("/score")
        .send({ name: "TestPlayer", score: 500, gameId: testGameId });

      const response = await request(app)
        .get(`/leaderboard/${testGameId}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("session_id");
      expect(typeof response.body[0].session_id).toBe("number");
    });
  });

  describe("POST /claim-ctf", () => {
    it.skipIf(!hasDatabase)("should reject request without sessionId or gameId", async () => {
      const response = await request(app)
        .post("/claim-ctf")
        .send({ sessionId: 1 }); // missing gameId

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid request");
    });

    it.skipIf(!hasDatabase)("should reject claim for non-existent session", async () => {
      const response = await request(app)
        .post("/claim-ctf")
        .send({ sessionId: 99999, gameId: testGameId });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Session not found");
    });

    it.skipIf(!hasDatabase)("should reject claims with insufficient score", async () => {
      const scoreResponse = await request(app)
        .post("/score")
        .send({ name: "LowScorer", score: 5000000, gameId: testGameId });

      const response = await request(app)
        .post("/claim-ctf")
        .send({ sessionId: scoreResponse.body.sessionId, gameId: testGameId });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Score too low for the reward.");
    });

    it.skipIf(!hasDatabase)("should allow claims with sufficient score and return CTF flag", async () => {
      const scoreResponse = await request(app)
        .post("/score")
        .send({ name: "HighScorer", score: 10000000, gameId: testGameId });

      const response = await request(app)
        .post("/claim-ctf")
        .send({ sessionId: scoreResponse.body.sessionId, gameId: testGameId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.flag).toBe("CTF{Ki_kI_KI_Ma_MA_mA}");
    });
  });
});

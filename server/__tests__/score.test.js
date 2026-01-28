import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";

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

  // POST /score endpoint
  app.post("/score", async (req, res) => {
    try {
      const { name, score, gameId } = req.body;

      if (!name || typeof score !== "number" || !gameId) {
        return res.status(400).json({ error: "Invalid data" });
      }

      if (score > 2147483647) {
        return res.status(400).json({ error: "I only eat signed 32-bit integer." });
      } else if (score < 0) {
        return res.status(400).json({ error: "Are you going backwards?🤔" });
      }

      let playerId = req.cookies.player_uuid;
      let isNewPlayer = false;

      if (playerId) {
        const existingPlayer = await prisma.player.findUnique({
          where: { player_id: playerId }
        });

        if (!existingPlayer) {
          const recreated = await prisma.player.create({
            data: { player_id: playerId }
          });
          playerId = recreated.player_id;
          isNewPlayer = true;
        }
      } else {
        const newPlayer = await prisma.player.create({ data: {} });
        playerId = newPlayer.player_id;
        isNewPlayer = true;
      }

      let existingSession = await prisma.game_session.findFirst({
        where: {
          player_id: playerId,
          game_id: gameId
        }
      });

      let sessionId;

      if (existingSession) {
        await prisma.game_session.update({
          where: { session_id: existingSession.session_id },
          data: {
            end_time: new Date(),
            final_score: score,
            time_played_seconds: 0,
            status: "finished"
          }
        });

        await prisma.leaderboard_entry.update({
          where: { session_id: existingSession.session_id },
          data: {
            player_name: name,
            score: score,
            achieved_date: new Date()
          }
        });

        sessionId = existingSession.session_id;
      } else {
        const session = await prisma.game_session.create({
          data: {
            player_id: playerId,
            game_id: gameId,
            start_time: new Date(),
            end_time: new Date(),
            final_score: score,
            time_played_seconds: 0,
            status: "finished"
          }
        });

        await prisma.leaderboard_entry.create({
          data: {
            game_id: gameId,
            session_id: session.session_id,
            player_name: name,
            score: score
          }
        });

        sessionId = session.session_id;
      }

      const canClaim = score > 9999999;

      if (isNewPlayer) {
        res.cookie("player_uuid", playerId, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          maxAge: 365 * 24 * 60 * 60 * 1000
        });
      }

      res.json({
        success: true,
        canClaim,
        sessionId: sessionId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /leaderboard/:gameId endpoint
  app.get("/leaderboard/:gameId", async (req, res) => {
    const gameId = Number(req.params.gameId);

    const entries = await prisma.leaderboard_entry.findMany({
      where: { game_id: gameId },
      orderBy: { score: "desc" }
    });

    const leaderboard = entries.map((entry, index) => ({
      rank: index + 1,
      player_name: entry.player_name,
      score: entry.score,
      achieved_date: entry.achieved_date,
      session_id: entry.session_id
    }));

    res.json(leaderboard);
  });

  // POST /claim-ctf endpoint
  app.post("/claim-ctf", async (req, res) => {
    try {
      const { sessionId, gameId } = req.body;

      if (!sessionId || !gameId) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const entry = await prisma.leaderboard_entry.findUnique({
        where: { session_id: sessionId }
      });

      if (!entry || entry.game_id !== gameId) {
        return res.status(403).json({ error: "Session not found" });
      }

      if (entry.score <= 9_999_999) {
        return res.status(403).json({
          success: false,
          message: "Score too low for the reward."
        });
      }

      const CTF_KEY = "CTF{Ki_kI_KI_Ma_MA_mA}";

      res.json({
        success: true,
        flag: CTF_KEY
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

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

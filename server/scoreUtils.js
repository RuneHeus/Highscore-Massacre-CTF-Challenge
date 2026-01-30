import { PrismaClient } from "@prisma/client";

export const SCORE_LIMITS = {
  MAX: 2147483647,
  MIN: 0,
  CTF_THRESHOLD: 9999999
};

export const MESSAGES = {
  INVALID_DATA: "Invalid data",
  SCORE_TOO_HIGH: "I only eat signed 32-bit integer.",
  SCORE_NEGATIVE: "Are you going backwards?🤔",
  LEADERBOARD_LIMIT: 100
};

/**
 * @param {string} name - Player name
 * @param {number} score - Score value
 * @param {number} gameId - Game ID
 * @returns {Object} {valid: boolean, error?: string}
 */
export function validateScoreSubmission(name, score, gameId) {
  if (!name || typeof score !== "number" || !gameId) {
    return { valid: false, error: MESSAGES.INVALID_DATA };
  }

  if (score > SCORE_LIMITS.MAX) {
    return { valid: false, error: MESSAGES.SCORE_TOO_HIGH };
  }

  if (score < SCORE_LIMITS.MIN) {
    return { valid: false, error: MESSAGES.SCORE_NEGATIVE };
  }

  return { valid: true };
}

/**
 * Get or create player and handle UUID management
 * @param {Object} prisma - Prisma client instance
 * @param {string} playerId - Existing player UUID from cookie
 * @returns {Object} {playerId: string, isNewPlayer: boolean}
 */
export async function getOrCreatePlayer(prisma, playerId) {
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

  return { playerId, isNewPlayer };
}

/**
 * Handle session and leaderboard updates
 * @param {Object} prisma - Prisma client instance
 * @param {string} playerId - Player ID
 * @param {number} gameId - Game ID
 * @param {string} name - Player name
 * @param {number} score - Score value
 * @returns {Object} {sessionId: number}
 */
export async function handleSessionAndLeaderboard(prisma, playerId, gameId, name, score) {
  let existingSession = await prisma.game_session.findFirst({
    where: {
      player_id: playerId,
      game_id: gameId
    }
  });

  let sessionId;

  if (existingSession) {
    // Only update if new score is higher than existing score
    if (score > existingSession.final_score) {
      // Update existing session
      await prisma.game_session.update({
        where: { session_id: existingSession.session_id },
        data: {
          end_time: new Date(),
          final_score: score,
          time_played_seconds: 0,
          status: "finished"
        }
      });

      // Update existing leaderboard entry
      await prisma.leaderboard_entry.update({
        where: { session_id: existingSession.session_id },
        data: {
          player_name: name,
          score: score,
          achieved_date: new Date()
        }
      });
    }

    sessionId = existingSession.session_id;
  } else {
    // Create new session
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

    // Create new leaderboard entry
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

  return { sessionId };
}

/**
 * maximum leaderboard entries
 * @param {Object} prisma - Prisma client instance
 * @param {number} gameId - Game ID
 * @param {number} limit - Maximum entries (default: 100)
 */
export async function enforceLeaderboardLimit(prisma, gameId, limit = MESSAGES.LEADERBOARD_LIMIT) {
  const total = await prisma.leaderboard_entry.count({
    where: { game_id: gameId }
  });

  if (total <= limit) return;

  const overflow = total - limit;
  const oldest = await prisma.leaderboard_entry.findMany({
    where: { 
      game_id: gameId,
      player_name: { not: "FinalCounselor" }
    },
    orderBy: { achieved_date: "asc" },
    take: overflow,
    select: { entry_id: true }
  });

  await prisma.leaderboard_entry.deleteMany({
    where: { entry_id: { in: oldest.map(e => e.entry_id) } }
  });
}

/**
 * Determine if score qualifies for CTF reward
 * @param {number} score - Score value
 * @returns {boolean}
 */
export function canClaimReward(score) {
  return score > SCORE_LIMITS.CTF_THRESHOLD;
}

/**
 * Build cookie options for player UUID persistence
 * @returns {Object} Cookie options
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 365 * 24 * 60 * 60 * 1000
  };
}

/**
 * Get leaderboard entries for a game
 * @param {Object} prisma - Prisma client instance
 * @param {number} gameId - Game ID
 * @returns {Array} Leaderboard entries with rank
 */
export async function getLeaderboard(prisma, gameId) {
  const orderBy = [
    { score: "desc" },
    { achieved_date: "asc" },
    { entry_id: "asc" }
  ];

  const entries = await prisma.leaderboard_entry.findMany({
    where: { game_id: gameId },
    orderBy,
    take: MESSAGES.LEADERBOARD_LIMIT
  });

  const finalCounselor = await prisma.leaderboard_entry.findFirst({
    where: { game_id: gameId, player_name: "FinalCounselor" },
    orderBy
  });

  const hasFinalCounselor = finalCounselor
    ? entries.some(entry => entry.session_id === finalCounselor.session_id)
    : false;

  let rankedEntries = entries.map((entry, index) => ({
    rank: index + 1,
    player_name: entry.player_name,
    score: entry.score,
    achieved_date: entry.achieved_date,
    session_id: entry.session_id
  }));

  if (finalCounselor && !hasFinalCounselor) {
    const higherCount = await prisma.leaderboard_entry.count({
      where: {
        game_id: gameId,
        OR: [
          { score: { gt: finalCounselor.score } },
          {
            score: finalCounselor.score,
            achieved_date: { lt: finalCounselor.achieved_date }
          },
          {
            score: finalCounselor.score,
            achieved_date: finalCounselor.achieved_date,
            entry_id: { lt: finalCounselor.entry_id }
          }
        ]
      }
    });

    if (rankedEntries.length >= MESSAGES.LEADERBOARD_LIMIT) {
      rankedEntries = rankedEntries.slice(0, MESSAGES.LEADERBOARD_LIMIT - 1);
    }

    rankedEntries.push({
      rank: higherCount + 1,
      player_name: finalCounselor.player_name,
      score: finalCounselor.score,
      achieved_date: finalCounselor.achieved_date,
      session_id: finalCounselor.session_id
    });
  }

  return rankedEntries;
}

/**
 * Validate and process CTF reward claim
 * @param {Object} prisma - Prisma client instance
 * @param {number} sessionId - Session ID
 * @param {number} gameId - Game ID
 * @returns {Object} {valid: boolean, error?: string, message?: string, statusCode?: number, entry?: Object}
 */
export async function validateCtfClaim(prisma, sessionId, gameId) {
  if (!sessionId || !gameId) {
    return { valid: false, error: "Invalid request", statusCode: 400 };
  }

  const entry = await prisma.leaderboard_entry.findUnique({
    where: { session_id: sessionId }
  });

  if (!entry || entry.game_id !== gameId) {
    return { valid: false, error: "Session not found", statusCode: 403 };
  }

  if (entry.score <= SCORE_LIMITS.CTF_THRESHOLD) {
    return {
      valid: false,
      message: "Score too low for the reward.",
      statusCode: 403
    };
  }

  return { valid: true, entry };
}

/**
 * Get CTF flag
 * @returns {string} CTF flag
 */
export function getCTFFlag() {
  return "CTF{Ki_kI_KI_Ma_MA_mA}";
}

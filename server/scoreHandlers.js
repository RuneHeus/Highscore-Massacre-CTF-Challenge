import {
  validateScoreSubmission,
  getOrCreatePlayer,
  handleSessionAndLeaderboard,
  enforceLeaderboardLimit,
  canClaimReward,
  getCookieOptions,
  getLeaderboard,
  validateCtfClaim,
  getCTFFlag
} from "./scoreUtils.js";

const defaultErrorHandler = (res, err) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
};

export function createScoreHandlers(prisma, { onError } = {}) {
  const handleError = onError || defaultErrorHandler;

  return {
    async handlePostScore(req, res) {
      try {
        const { name, score, gameId } = req.body;

        const validation = validateScoreSubmission(name, score, gameId);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }

        let playerId = req.cookies.player_uuid;
        const { playerId: finalPlayerId, isNewPlayer } = await getOrCreatePlayer(prisma, playerId);
        playerId = finalPlayerId;

        const { sessionId } = await handleSessionAndLeaderboard(
          prisma,
          playerId,
          gameId,
          name,
          score
        );

        const claimable = canClaimReward(score);

        if (isNewPlayer) {
          res.cookie("player_uuid", playerId, getCookieOptions());
        }

        await enforceLeaderboardLimit(prisma, gameId);

        res.json({
          success: true,
          canClaim: claimable,
          sessionId: sessionId
        });
      } catch (err) {
        handleError(res, err);
      }
    },

    async handleGetLeaderboard(req, res) {
      try {
        const gameId = Number(req.params.gameId);
        const leaderboard = await getLeaderboard(prisma, gameId);
        res.json(leaderboard);
      } catch (err) {
        handleError(res, err);
      }
    },

    async handleClaimCtf(req, res) {
      try {
        const { sessionId, gameId } = req.body;

        const validation = await validateCtfClaim(prisma, sessionId, gameId);
        if (!validation.valid) {
          const statusCode = validation.statusCode || 400;
          const response = { success: false };
          if (validation.message) {
            response.message = validation.message;
          } else if (validation.error) {
            response.error = validation.error;
          }
          return res.status(statusCode).json(response);
        }

        const flag = getCTFFlag();
        res.json({
          success: true,
          flag: flag
        });
      } catch (err) {
        handleError(res, err);
      }
    }
  };
}

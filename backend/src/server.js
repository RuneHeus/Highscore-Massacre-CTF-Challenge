import express from 'express';
import { prisma } from './prisma.js';

const app = express();
app.use(express.json());

app.get('/leaderboard/:gameId', async (req, res) => {
  const gameId = Number(req.params.gameId);

  const leaderboard = await prisma.leaderboard_entry.findMany({
    where: { game_id: gameId },
    orderBy: { score: 'desc' },
    take: 10
  });

  res.json(leaderboard);
});

app.listen(3000, () => console.log('API running on :3000'));
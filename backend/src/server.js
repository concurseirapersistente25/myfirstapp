import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, '../data/world-cup-2026.json');
const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-2026';

export const app = express();
app.use(cors());
app.use(express.json());

const readData = async () => {
  const raw = await fs.readFile(dataFile, 'utf-8');
  return JSON.parse(raw);
};

const writeData = async (data) => {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
};

const isAuthorized = (req) => req.headers['x-admin-key'] === ADMIN_KEY;

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.get('/api/world-cup', async (_, res) => {
  const data = await readData();
  res.json(data);
});

app.put('/api/world-cup/matches/:id', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  const { id } = req.params;
  const { date, homeScore, awayScore, status, stadium } = req.body;

  const data = await readData();
  const match = data.matches.find((item) => item.id === id);

  if (!match) {
    return res.status(404).json({ message: 'Jogo não encontrado.' });
  }

  if (date !== undefined) match.date = date;
  if (stadium !== undefined) match.stadium = stadium;
  if (homeScore !== undefined) match.homeScore = homeScore;
  if (awayScore !== undefined) match.awayScore = awayScore;
  if (status !== undefined) match.status = status;

  await writeData(data);

  return res.json({ message: 'Jogo atualizado com sucesso.', match });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend da Copa 2026 rodando em http://localhost:${PORT}`);
  });
}


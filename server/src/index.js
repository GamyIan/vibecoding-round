import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chat.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { isMockMode } from './services/llm.service.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api', chatRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isMockMode()) console.warn('LLM_API_KEY not set - running in mock mode');
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chat.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { getDefaultProvider } from './config/providers.js';

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
  const provider = getDefaultProvider();
  if (provider) console.log(`Default AI provider: ${provider}`);
  else console.warn('No AI API key set - running in mock mode');
});

import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  // Fallback for local dev when no MongoDB is configured
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    // Pin the binary cache to server/node_modules so it is reused no matter where the server is started from
    const downloadDir = fileURLToPath(new URL('../../node_modules/.cache/mongodb-memory-server', import.meta.url));
    const mem = await MongoMemoryServer.create({ binary: { downloadDir } });
    uri = mem.getUri();
    console.warn('MONGODB_URI not set - using in-memory MongoDB (data is lost on restart)');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

import mongoose from 'mongoose';

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  // Fallback for local dev when no MongoDB is configured
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    console.warn('MONGODB_URI not set - using in-memory MongoDB (data is lost on restart)');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

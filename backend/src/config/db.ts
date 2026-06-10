import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

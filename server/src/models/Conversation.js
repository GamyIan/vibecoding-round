import mongoose from 'mongoose';
import { TONES } from '../services/tone.service.js';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tone: { type: String, enum: Object.keys(TONES) },
    model: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New chat' },
    tone: { type: String, enum: Object.keys(TONES), default: 'professional' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);

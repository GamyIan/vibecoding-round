import Conversation from '../models/Conversation.js';
import { listTones } from '../services/tone.service.js';

export function getTones(req, res) {
  res.json(listTones());
}

export async function listConversations(req, res) {
  const conversations = await Conversation.find({}, 'title tone updatedAt').sort({ updatedAt: -1 }).lean();
  res.json(conversations);
}

export async function getConversation(req, res) {
  const conversation = await Conversation.findById(req.params.id).lean();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  res.json(conversation);
}

export async function deleteConversation(req, res) {
  const deleted = await Conversation.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Conversation not found' });
  res.status(204).end();
}

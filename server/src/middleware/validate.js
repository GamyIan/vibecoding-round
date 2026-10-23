import mongoose from 'mongoose';
import { isValidTone } from '../services/tone.service.js';
import { isProviderAvailable } from '../config/providers.js';

export const MAX_MESSAGE_LENGTH = 4000;

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return badRequest(res, 'Invalid conversation id');
  next();
}

export function validateChatRequest(req, res, next) {
  const { message, tone, model, conversationId, regenerate } = req.body ?? {};

  if (conversationId != null && !mongoose.isValidObjectId(conversationId)) {
    return badRequest(res, 'Invalid conversation id');
  }
  if (!isValidTone(tone)) return badRequest(res, 'Invalid tone');
  if (model != null && !isProviderAvailable(model)) {
    return badRequest(res, 'Selected model is not available (API key not configured)');
  }

  if (regenerate) {
    if (!conversationId) return badRequest(res, 'conversationId is required to regenerate');
  } else {
    if (typeof message !== 'string' || !message.trim()) return badRequest(res, 'Message is required');
    if (message.length > MAX_MESSAGE_LENGTH) {
      return badRequest(res, `Message must be at most ${MAX_MESSAGE_LENGTH} characters`);
    }
    req.body.message = message.trim();
  }
  next();
}

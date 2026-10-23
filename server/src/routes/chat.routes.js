import { Router } from 'express';
import { chat } from '../controllers/chat.controller.js';
import {
  getTones,
  listConversations,
  getConversation,
  deleteConversation,
} from '../controllers/conversation.controller.js';
import { validateChatRequest, validateObjectId } from '../middleware/validate.js';

const router = Router();

router.get('/tones', getTones);
router.get('/conversations', listConversations);
router.get('/conversations/:id', validateObjectId, getConversation);
router.delete('/conversations/:id', validateObjectId, deleteConversation);
router.post('/chat', validateChatRequest, chat);

export default router;

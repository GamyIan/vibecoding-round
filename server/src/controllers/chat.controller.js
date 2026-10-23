import Conversation from '../models/Conversation.js';
import { streamReply, generateTitle } from '../services/llm.service.js';

function sendEvent(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * POST /api/chat
 * Body: { message, tone, conversationId?, regenerate? }
 * Streams the reply as Server-Sent Events: meta -> delta* -> done | error
 */
export async function chat(req, res) {
  const { message, tone, conversationId, regenerate } = req.body;

  let conversation = conversationId ? await Conversation.findById(conversationId) : new Conversation();
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

  if (regenerate) {
    // Drop the last assistant reply so the last user message gets answered again
    if (conversation.messages.at(-1)?.role === 'assistant') conversation.messages.pop();
    if (conversation.messages.at(-1)?.role !== 'user') {
      return res.status(400).json({ error: 'Nothing to regenerate' });
    }
  } else {
    conversation.messages.push({ role: 'user', content: message });
  }
  conversation.tone = tone;
  await conversation.save();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  sendEvent(res, { type: 'meta', conversationId: conversation._id });

  // Stop the upstream LLM call if the client disconnects (e.g. "Stop" button)
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  let reply = '';
  try {
    for await (const text of streamReply(conversation.messages, tone, controller.signal)) {
      reply += text;
      sendEvent(res, { type: 'delta', text });
    }
    if (!reply && !controller.signal.aborted) throw new Error('Empty response from AI service');
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error('LLM error:', err.message);
      sendEvent(res, { type: 'error', message: 'The AI service failed to respond. Please try again.' });
    }
  }

  // Persist whatever was generated, including partial replies from a stopped stream
  if (reply) {
    conversation.messages.push({ role: 'assistant', content: reply, tone });
    const isFirstExchange = conversation.messages.length === 2;
    if (isFirstExchange) {
      conversation.title = await generateTitle(conversation.messages[0].content, reply);
    }
    await conversation.save();
  }

  if (!controller.signal.aborted) {
    sendEvent(res, { type: 'done', title: conversation.title });
    res.end();
  }
}

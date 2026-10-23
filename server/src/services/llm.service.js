import OpenAI from 'openai';
import { getSystemPrompt } from './tone.service.js';

// Number of past messages sent to the model as context
const HISTORY_LIMIT = 20;

let client = null;
function getClient() {
  if (!client && process.env.LLM_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || undefined,
    });
  }
  return client;
}

export function isMockMode() {
  return !getClient();
}

function buildMessages(history, tone) {
  return [
    { role: 'system', content: getSystemPrompt(tone) },
    ...history.slice(-HISTORY_LIMIT).map(({ role, content }) => ({ role, content })),
  ];
}

/**
 * Streams the assistant reply as text chunks.
 * @param {Array<{role, content}>} history - conversation so far (ending with the user message)
 * @param {string} tone - tone id, turned into the system instruction
 * @param {AbortSignal} signal - aborts the upstream request when the client disconnects
 */
export async function* streamReply(history, tone, signal) {
  if (isMockMode()) {
    yield* mockStream(history.at(-1)?.content ?? '', tone, signal);
    return;
  }

  const stream = await getClient().chat.completions.create(
    {
      model: process.env.LLM_MODEL,
      messages: buildMessages(history, tone),
      stream: true,
    },
    { signal }
  );

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

/** Generates a short title for a conversation from its first exchange. */
export async function generateTitle(userMessage, assistantReply) {
  const fallback = userMessage.trim().split(/\s+/).slice(0, 6).join(' ');
  if (isMockMode()) return fallback;

  try {
    const res = await getClient().chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Generate a short title (max 6 words) summarizing this conversation. Reply with the title only, no quotes or punctuation at the end.',
        },
        { role: 'user', content: `User: ${userMessage}\nAssistant: ${assistantReply.slice(0, 500)}` },
      ],
      max_tokens: 20,
    });
    return res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || fallback;
  } catch (err) {
    console.error('Title generation failed:', err.message);
    return fallback;
  }
}

async function* mockStream(prompt, tone, signal) {
  const reply = `[Mock mode - set LLM_API_KEY to use a real model]\n\nYou said: "${prompt}". This reply is in the **${tone}** tone.`;
  for (const word of reply.split(/(\s+)/)) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 40));
    yield word;
  }
}

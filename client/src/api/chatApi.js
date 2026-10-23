const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const getTones = () => request('/tones');
export const getConversations = () => request('/conversations');
export const getConversation = (id) => request(`/conversations/${id}`);
export const deleteConversation = (id) => request(`/conversations/${id}`, { method: 'DELETE' });

/**
 * Sends a chat message and reads the Server-Sent Events stream.
 * Calls onEvent for each event: { type: 'meta' | 'delta' | 'done' | 'error', ... }
 */
export async function streamChat({ message, tone, conversationId, regenerate, signal, onEvent }) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tone, conversationId, regenerate }),
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line
    const events = buffer.split('\n\n');
    buffer = events.pop();
    for (const event of events) {
      const data = event.replace(/^data: /, '');
      if (data) onEvent(JSON.parse(data));
    }
  }
}

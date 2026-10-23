# AI Chat Assistant

A full-stack chat app with real-time streaming responses, persistent conversation history and a tone toggle.

**Stack:** React + Vite (frontend) · Node.js + Express (backend) · MongoDB + Mongoose · OpenAI Chat Completions API via the official `openai` SDK (OpenAI, Claude, Groq)

## Features

- **Chat interface** – scrollable conversation with distinct user / AI bubbles, Markdown rendering for AI replies
- **Streaming view** – the server streams tokens over Server-Sent Events; the client reveals them character-by-character with a typing cursor
- **History sidebar** – past conversation threads, click to reload, delete with ×
- **Persistence** – each conversation is stored in MongoDB with its messages (role, content, timestamp, tone)
- **Tone toggle (Vibe Check)** – Professional / Casual / Concise. The backend maps the selected tone to a **system instruction** that is sent with every AI request, so the style changes on the very next reply

### Extra features

1. **AI-generated conversation titles** – after the first exchange the backend asks the model for a short (≤ 6 words) title, so the sidebar shows meaningful thread names instead of "New chat"
3. **Model switcher** – choose between Groq (free Llama 3.3), OpenAI (GPT-4o mini) and Claude (Haiku). All three use the OpenAI Chat Completions format; a model is enabled only when its API key is configured, and the server validates the choice
2. **Stop & Regenerate** – stop a response mid-stream (the upstream AI request is aborted and the partial reply is kept), or regenerate the last answer (optionally in a different tone)

## Architecture

```
server/src
  index.js                      Express app bootstrap
  config/db.js                  MongoDB connection (in-memory fallback for local dev)
  models/Conversation.js        Conversation + message schema
  routes/chat.routes.js         API routes
  controllers/chat.controller.js          Streaming chat endpoint (SSE)
  controllers/conversation.controller.js  History CRUD + tones
  services/llm.service.js       AI API calls, streaming, title generation, mock mode
  services/tone.service.js      Tone → system instruction mapping
  middleware/validate.js        Request validation
  middleware/errorHandler.js    404 + error handling

client/src
  api/chatApi.js                All HTTP calls + SSE stream parsing
  hooks/useChat.js              Chat state, streaming, typewriter effect
  components/                   Sidebar, ToneToggle, ChatWindow, MessageBubble, ChatInput
```

All business logic (validation, tone → system prompt, context building, title generation, persistence) lives on the server. The frontend only handles presentation and user interaction.

### API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tones` | Available tones |
| GET | `/api/models` | AI providers and whether each is available (key configured) |
| GET | `/api/conversations` | Conversation list (title, tone, updatedAt) |
| GET | `/api/conversations/:id` | Full conversation |
| DELETE | `/api/conversations/:id` | Delete a conversation |
| POST | `/api/chat` | `{ message, tone, model?, conversationId?, regenerate? }` → SSE stream of `meta`, `delta`, `done` / `error` events |

### Chat request flow

1. Validate input (message, tone, conversation id)
2. Load or create the conversation, save the user message
3. Build the AI request: tone system instruction + last 20 messages
4. Stream the reply to the client as SSE `delta` events
5. Save the AI reply; on the first exchange, generate a title

## Running locally

Requires Node.js 18+.

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI and at least one API key
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev            # http://localhost:5173 (proxies /api to the backend)
```

### Environment variables (`server/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string. If empty, an in-memory MongoDB is used (data lost on restart) |
| `GROQ_API_KEY` | Enables Llama 3.3 70B via Groq's OpenAI-compatible endpoint (free tier) |
| `OPENAI_API_KEY` | Enables GPT-4o mini via `https://api.openai.com/v1` (paid) |
| `ANTHROPIC_API_KEY` | Enables Claude Haiku via Anthropic's OpenAI-compatible endpoint (paid) |
| `GROQ_MODEL` / `OPENAI_MODEL` / `ANTHROPIC_MODEL` | Optional model overrides |

If no API key is set, the server runs in **mock mode** with canned streamed replies. Providers are configured in `server/src/config/providers.js`.

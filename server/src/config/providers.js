// AI model providers. All use the OpenAI Chat Completions API format via the official `openai` SDK.
// A provider is available only when its API key is set in .env.
export const PROVIDERS = {
  groq: {
    label: 'Llama 3.3 70B (Groq, free)',
    baseURL: 'https://api.groq.com/openai/v1',
    keyEnv: 'GROQ_API_KEY',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  openai: {
    label: 'GPT-4o mini (OpenAI)',
    baseURL: 'https://api.openai.com/v1',
    keyEnv: 'OPENAI_API_KEY',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  claude: {
    label: 'Claude Haiku (Anthropic)',
    baseURL: 'https://api.anthropic.com/v1/',
    keyEnv: 'ANTHROPIC_API_KEY',
    model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
  },
};

export function isProviderAvailable(id) {
  return Object.hasOwn(PROVIDERS, id) && Boolean(process.env[PROVIDERS[id].keyEnv]);
}

export function getDefaultProvider() {
  return Object.keys(PROVIDERS).find(isProviderAvailable) ?? null;
}

export function listProviders() {
  return Object.entries(PROVIDERS).map(([id, { label }]) => ({
    id,
    label,
    available: isProviderAvailable(id),
  }));
}

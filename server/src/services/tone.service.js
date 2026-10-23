// Tone presets: each one is injected as the system instruction for the AI request
export const TONES = {
  professional: {
    label: 'Professional',
    prompt:
      'You are a helpful AI assistant. Respond in a professional, formal and well-structured tone. Use precise language and avoid slang.',
  },
  casual: {
    label: 'Casual',
    prompt:
      'You are a friendly AI assistant. Respond in a casual, relaxed and conversational tone, like chatting with a friend. Light humor and emojis are fine.',
  },
  concise: {
    label: 'Concise',
    prompt:
      'You are an AI assistant. Respond as briefly as possible: get straight to the point, use short sentences or bullet points, and skip any filler.',
  },
};

export const DEFAULT_TONE = 'professional';

export function isValidTone(tone) {
  return Object.hasOwn(TONES, tone);
}

export function getSystemPrompt(tone) {
  return (TONES[tone] ?? TONES[DEFAULT_TONE]).prompt;
}

export function listTones() {
  return Object.entries(TONES).map(([id, { label }]) => ({ id, label }));
}

import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api/chatApi';

// Typewriter effect: how often (ms) buffered text is revealed
const TYPE_INTERVAL = 15;

export function useChat() {
  const [tones, setTones] = useState([]);
  const [tone, setTone] = useState('professional');
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const pendingRef = useRef(''); // streamed text not yet shown on screen

  const refreshConversations = useCallback(() => {
    api.getConversations().then(setConversations).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    api.getTones().then(setTones).catch((e) => setError(e.message));
    refreshConversations();
  }, [refreshConversations]);

  // Reveal streamed text character-by-character into the last assistant message
  useEffect(() => {
    const timer = setInterval(() => {
      const pending = pendingRef.current;
      if (!pending) return;
      // Speed up when lots of text is buffered so we never fall far behind
      const take = Math.max(1, Math.ceil(pending.length / 30));
      pendingRef.current = pending.slice(take);
      setMessages((prev) => {
        const last = prev.at(-1);
        if (last?.role !== 'assistant') return prev;
        return [...prev.slice(0, -1), { ...last, content: last.content + pending.slice(0, take) }];
      });
    }, TYPE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const runStream = useCallback(
    async ({ message, regenerate }) => {
      setError(null);
      setIsStreaming(true);
      pendingRef.current = '';
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await api.streamChat({
          message,
          tone,
          conversationId: activeId,
          regenerate,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === 'meta') setActiveId(event.conversationId);
            else if (event.type === 'delta') pendingRef.current += event.text;
            else if (event.type === 'error') setError(event.message);
          },
        });
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        refreshConversations();
      }
    },
    [tone, activeId, refreshConversations]
  );

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || isStreaming) return;
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: '', tone },
      ]);
      runStream({ message: text });
    },
    [isStreaming, tone, runStream]
  );

  const regenerate = useCallback(() => {
    if (isStreaming || !activeId) return;
    setMessages((prev) => [
      ...(prev.at(-1)?.role === 'assistant' ? prev.slice(0, -1) : prev),
      { role: 'assistant', content: '', tone },
    ]);
    runStream({ regenerate: true });
  }, [isStreaming, activeId, tone, runStream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    // Show everything received so far immediately
    const rest = pendingRef.current;
    pendingRef.current = '';
    if (rest) {
      setMessages((prev) => {
        const last = prev.at(-1);
        return [...prev.slice(0, -1), { ...last, content: last.content + rest }];
      });
    }
  }, []);

  const selectConversation = useCallback(
    async (id) => {
      if (isStreaming) return;
      try {
        const conversation = await api.getConversation(id);
        pendingRef.current = '';
        setActiveId(id);
        setMessages(conversation.messages);
        setTone(conversation.tone);
        setError(null);
      } catch (e) {
        setError(e.message);
      }
    },
    [isStreaming]
  );

  const newChat = useCallback(() => {
    if (isStreaming) return;
    pendingRef.current = '';
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, [isStreaming]);

  const removeConversation = useCallback(
    async (id) => {
      try {
        await api.deleteConversation(id);
        if (id === activeId) newChat();
        refreshConversations();
      } catch (e) {
        setError(e.message);
      }
    },
    [activeId, newChat, refreshConversations]
  );

  return {
    tones,
    tone,
    setTone,
    conversations,
    activeId,
    messages,
    isStreaming,
    error,
    sendMessage,
    regenerate,
    stop,
    selectConversation,
    newChat,
    removeConversation,
  };
}

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, isStreaming, onRegenerate }) {
  const bottomRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-window empty">
        <h1>How can I help you today?</h1>
        <p>Pick a tone above and start chatting.</p>
      </div>
    );
  }

  const last = messages.at(-1);
  return (
    <div className="chat-window">
      {messages.map((m, i) => (
        <MessageBubble
          key={m._id ?? i}
          role={m.role}
          content={m.content}
          tone={m.tone}
          isTyping={isStreaming && i === messages.length - 1}
        />
      ))}
      {!isStreaming && last.role === 'assistant' && (
        <button className="regenerate" onClick={onRegenerate}>
          ↻ Regenerate
        </button>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

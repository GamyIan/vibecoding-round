import { useState } from 'react';

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSend(text);
    setText('');
  };

  // Enter sends, Shift+Enter adds a new line
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <form className="chat-input" onSubmit={submit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        rows={1}
      />
      {isStreaming ? (
        <button type="button" className="stop" onClick={onStop}>
          ■ Stop
        </button>
      ) : (
        <button type="submit" disabled={!text.trim()}>
          Send
        </button>
      )}
    </form>
  );
}

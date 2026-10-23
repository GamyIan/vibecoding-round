import Markdown from 'react-markdown';

export default function MessageBubble({ role, content, tone, isTyping }) {
  const isUser = role === 'user';
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="bubble">
        {isUser ? (
          <p>{content}</p>
        ) : (
          <>
            <Markdown>{content}</Markdown>
            {isTyping && <span className="cursor">▍</span>}
          </>
        )}
      </div>
      {!isUser && tone && <span className="message-meta">{tone}</span>}
    </div>
  );
}

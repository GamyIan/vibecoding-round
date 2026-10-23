import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import ToneToggle from './components/ToneToggle';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

export default function App() {
  const chat = useChat();

  return (
    <div className="app">
      <Sidebar
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.selectConversation}
        onNew={chat.newChat}
        onDelete={chat.removeConversation}
      />
      <main className="main">
        <header className="header">
          <span className="brand">AI Chat Assistant</span>
          <ToneToggle tones={chat.tones} value={chat.tone} onChange={chat.setTone} />
        </header>
        <ChatWindow messages={chat.messages} isStreaming={chat.isStreaming} onRegenerate={chat.regenerate} />
        {chat.error && <div className="error">{chat.error}</div>}
        <ChatInput onSend={chat.sendMessage} onStop={chat.stop} isStreaming={chat.isStreaming} />
      </main>
    </div>
  );
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="sidebar">
      <button className="new-chat" onClick={onNew}>
        + New chat
      </button>
      <h2 className="sidebar-title">History</h2>
      <ul className="history">
        {conversations.length === 0 && <li className="history-empty">No conversations yet</li>}
        {conversations.map((c) => (
          <li
            key={c._id}
            className={`history-item ${c._id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(c._id)}
          >
            <span className="history-title">{c.title}</span>
            <button
              className="history-delete"
              title="Delete conversation"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c._id);
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

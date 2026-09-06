import { X } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import * as sessionStore from '../lib/sessionStore';
import type { ChatMessage } from '../types/domain';

interface ChatDrawerProps {
  code: string;
  messages: ChatMessage[];
  by: { pid: string; name: string };
  onClose: () => void;
}

export function ChatDrawer({ code, messages, by, onClose }: ChatDrawerProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    sessionStore.sendChatMessage(code, trimmed, by);
    setDraft('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  return (
    <div className="chat-overlay" onClick={onClose}>
      <aside className="chat-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>Chat</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close chat"
            title="Close"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <p className="chat-empty">No messages yet — say hello.</p>
          )}
          {messages.map((m) => {
            const own = m.senderPid === by.pid;
            return (
              <div key={m.id} className={`chat-message ${own ? 'own' : ''}`}>
                {!own && <span className="chat-message-sender">{m.senderName}</span>}
                <div className="chat-message-bubble">{m.text}</div>
                <span className="chat-message-time">
                  {new Date(m.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message the family…"
          />
          <button type="submit" disabled={!draft.trim()}>
            Send
          </button>
        </form>
      </aside>
    </div>
  );
}

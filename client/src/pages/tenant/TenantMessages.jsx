import { Send } from 'lucide-react';
import { useState } from 'react';

export default function TenantMessages() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Rent reminder sent for April — let me know once paid.', sender: 'landlord' },
    { id: 2, text: 'Payment initiated via Stripe — sharing receipt shortly.', sender: 'tenant' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'tenant' }]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Conversations</h2>
        <div className="mt-3 space-y-2">
          {['Riya Mehta — Skyline', 'Urban Nest landlord', 'Maintenance desk'].map((c) => (
            <button
              key={c}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm hover:border-brand-200 hover:bg-white"
            >
              <span className="font-medium text-slate-900">{c}</span>
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">2</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Riya Mehta</p>
          <p className="text-xs text-slate-500">Socket.io powers live delivery on the MERN API.</p>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'tenant'
                ? 'ml-auto rounded-br-md bg-brand-600 text-white'
                : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <footer className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm"
              placeholder="Type a message…"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

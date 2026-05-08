import { useState } from 'react';

export default function TenantNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Rent reminder', body: 'April rent is due in 3 days.', time: '2h ago', read: false },
    { id: 2, title: 'Maintenance update', body: 'Plumber assigned for ticket #4821.', time: 'Yesterday', read: false },
    { id: 3, title: 'New listing match', body: '92% match — Skyline Heights 2BHK.', time: '2 days ago', read: true },
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
            onClick={() => markAsRead(n.id)}
          >
            <span className={`mt-1 h-2 w-2 rounded-full ${n.read ? 'bg-slate-300' : 'bg-brand-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-600">{n.body}</p>
            </div>
            <span className="text-xs text-slate-400">{n.time}</span>
          </div>
        ))}
      </div>
      {unreadCount > 0 && (
        <div className="text-sm text-slate-500">
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

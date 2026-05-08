import { useState } from 'react';

const initialTickets = [
  { title: 'Leaking kitchen tap', desc: 'Water dripping continuously', badges: ['High', 'Open', 'Plumbing'], date: '2025-04-16', property: 'Skyline Heights — 12B', tenant: 'Aarav Sharma' },
  { title: 'Power fluctuation', desc: 'Living room sockets sparking', badges: ['Urgent', 'Open', 'Electrical'], date: '2025-04-15', property: 'Palm Grove Villa', tenant: 'Priya Iyer' },
];

export default function LandlordMaintenance() {
  const [tickets, setTickets] = useState(initialTickets);

  const handleAssign = (title) => {
    setTickets((prev) => prev.map((ticket) =>
      ticket.title === title && !ticket.badges.includes('Assigned')
        ? { ...ticket, badges: [...ticket.badges, 'Assigned'] }
        : ticket
    ));
  };

  const handleUpdate = (title) => {
    setTickets((prev) => prev.map((ticket) => {
      if (ticket.title !== title) return ticket;
      const updatedBadges = ticket.badges.filter((badge) => badge !== 'Open');
      if (!updatedBadges.includes('In progress')) {
        updatedBadges.push('In progress');
      }
      return { ...ticket, badges: updatedBadges };
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance queue</h1>
        <p className="text-sm text-slate-600">Open tickets ordered by priority.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open', value: '3', tone: 'text-rose-600' },
          { label: 'In progress', value: '2', tone: 'text-amber-600' },
          { label: 'Resolved', value: '1', tone: 'text-emerald-600' },
          { label: 'High priority', value: '3', tone: 'text-amber-700' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tickets.map((t) => (
          <article key={t.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {t.badges.map((b) => (
                  <span
                    key={b}
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                      b === 'Open' || b === 'High' || b === 'Urgent'
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                        : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
                    ].join(' ')}
                  >
                    {b}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500">{t.date}</span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{t.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            <p className="mt-3 text-xs text-slate-500">
              {t.property} <span className="text-slate-400">•</span> {t.tenant}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAssign(t.title)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(t.title)}
                className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Update
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

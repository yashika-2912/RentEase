import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';

export default function AdminMaintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/maintenance');
        setItems(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load maintenance');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(
    () => ({
      total: items.length,
      open: items.filter((item) => item.status === 'open').length,
      inProgress: items.filter((item) => item.status === 'in-progress').length,
      urgent: items.filter((item) => item.priority === 'urgent' || item.priority === 'high').length,
    }),
    [items]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="text-sm text-slate-600">Escalations and SLA tracking across seeded tenant issues.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tickets', value: summary.total, tone: 'text-slate-900' },
          { label: 'Open', value: summary.open, tone: 'text-rose-700' },
          { label: 'In progress', value: summary.inProgress, tone: 'text-amber-700' },
          { label: 'High priority', value: summary.urgent, tone: 'text-brand-700' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm lg:col-span-2">
            Loading maintenance tickets...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm lg:col-span-2">
            No maintenance tickets found.
          </div>
        ) : (
          items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                      item.priority === 'urgent' || item.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                        : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
                    ].join(' ')}
                  >
                    {item.priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-700 ring-1 ring-slate-200">
                    {item.status}
                  </span>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold uppercase text-brand-700 ring-1 ring-brand-100">
                    {item.category}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '-'}
                </span>
              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>

              <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <div>
                  <span className="font-semibold text-slate-700">Tenant:</span> {item.tenant?.name || 'Unknown'}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Landlord:</span> {item.landlord?.name || 'Unknown'}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Property:</span> {item.property?.title || 'Unknown'}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

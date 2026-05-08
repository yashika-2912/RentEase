import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function monthLabel(month, year) {
  return new Date(year || 2026, (month || 1) - 1, 1).toLocaleString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminPayments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/payments');
        setItems(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load payments');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const paid = items.filter((item) => item.status === 'paid');
    const overdue = items.filter((item) => item.status === 'overdue');
    const pending = items.filter((item) => item.status === 'pending');
    return {
      total: items.length,
      collected: paid.reduce((sum, item) => sum + (item.amount || 0), 0),
      overdueAmount: overdue.reduce((sum, item) => sum + (item.amount || 0), 0),
      pendingCount: pending.length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-600">Platform-wide payment monitoring for the seeded rent cycles.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Records', value: summary.total, tone: 'text-slate-900' },
          { label: 'Collected', value: money(summary.collected), tone: 'text-emerald-700' },
          { label: 'Overdue amount', value: money(summary.overdueAmount), tone: 'text-rose-700' },
          { label: 'Pending payments', value: summary.pendingCount, tone: 'text-amber-700' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Landlord</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Cycle</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.tenant?.name || 'Unknown tenant'}</div>
                      <div className="text-xs text-slate-500">{item.tenant?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{item.landlord?.name || 'Unknown landlord'}</div>
                      <div className="text-xs text-slate-500">{item.landlord?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.lease?.property?.title || 'Property unavailable'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{monthLabel(item.month, item.year)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{money(item.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                          item.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : item.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                              : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
                        ].join(' ')}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

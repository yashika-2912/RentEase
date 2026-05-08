import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';

function fmtDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '-';
}

export default function AdminLeases() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/leases');
        setItems(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load leases');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.status === 'active').length,
      pending: items.filter((item) => item.status === 'pending').length,
      expired: items.filter((item) => item.status === 'expired').length,
    }),
    [items]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lease management</h1>
        <p className="text-sm text-slate-600">Cross-tenant lease operations using the seeded dataset.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total leases', value: summary.total, tone: 'text-slate-900' },
          { label: 'Active', value: summary.active, tone: 'text-emerald-700' },
          { label: 'Pending', value: summary.pending, tone: 'text-amber-700' },
          { label: 'Expired', value: summary.expired, tone: 'text-slate-700' },
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
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Landlord</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Rent</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading leases...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No leases found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.property?.title || 'Unknown property'}</div>
                      <div className="text-xs text-slate-500">{item.property?.address?.city || 'Unknown city'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{item.tenant?.name || 'Unknown tenant'}</div>
                      <div className="text-xs text-slate-500">{item.tenant?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{item.landlord?.name || 'Unknown landlord'}</div>
                      <div className="text-xs text-slate-500">{item.landlord?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmtDate(item.startDate)} - {fmtDate(item.endDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Rs {Number(item.monthlyRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Rs {Number(item.deposit || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : item.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
                              : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
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

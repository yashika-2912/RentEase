import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';

function currency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function AdminProperties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function loadProperties() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/properties');
      setItems(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load properties');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  const summary = useMemo(() => {
    const pending = items.filter((item) => !item.isApproved).length;
    const approved = items.filter((item) => item.isApproved).length;
    const occupied = items.filter((item) => item.isAvailable === false).length;
    return { total: items.length, pending, approved, occupied };
  }, [items]);

  async function updateApproval(id, approved) {
    setBusyId(id);
    setError('');
    try {
      await api.put(`/admin/properties/${id}/approve`, {
        approved,
        rejectionReason: approved ? '' : 'Rejected by admin dashboard moderation',
      });
      await loadProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update approval');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
        <p className="text-sm text-slate-600">Approve, reject, and moderate seeded listings.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total listings', value: summary.total, tone: 'text-slate-900' },
          { label: 'Pending approval', value: summary.pending, tone: 'text-amber-700' },
          { label: 'Approved', value: summary.approved, tone: 'text-emerald-700' },
          { label: 'Occupied', value: summary.occupied, tone: 'text-brand-700' },
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
                <th className="px-4 py-3">Landlord</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Rent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading properties...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No properties found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500 capitalize">
                        {item.type} - {item.bedrooms} bed - {item.bathrooms} bath
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{item.landlord?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{item.landlord?.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.address?.city || 'Unknown city'}, {item.address?.state || 'Unknown state'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{currency(item.rent)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                          item.isApproved
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
                        ].join(' ')}
                      >
                        {item.isApproved ? 'approved' : 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                          item.isAvailable
                            ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
                        ].join(' ')}
                      >
                        {item.isAvailable ? 'available' : 'occupied'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateApproval(item._id, true)}
                          disabled={busyId === item._id || item.isApproved}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateApproval(item._id, false)}
                          disabled={busyId === item._id || !item.isApproved}
                          className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
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

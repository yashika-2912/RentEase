import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function LandlordPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data } = await api.get('/payments/landlord/mine');
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment(paymentId) {
    setConfirming(paymentId);
    try {
      await api.put(`/payments/${paymentId}/manual-confirm`);
      await fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    } finally {
      setConfirming(null);
    }
  }

  const exportCsv = () => {
    const headers = ['Tenant', 'Property', 'Period', 'Amount', 'Status'];
    const rows = payments.map((payment) => {
      const period = new Date(payment.year, payment.month - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      return [
        payment.lease?.tenant?.name || 'Unknown Tenant',
        payment.lease?.property?.title || 'Unknown Property',
        period,
        payment.amount,
        payment.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'landlord-payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = payments.reduce(
    (acc, payment) => {
      if (payment.status === 'paid') {
        acc.collected += payment.amount;
      } else if (payment.status === 'overdue') {
        acc.overdue += payment.amount;
      } else {
        acc.pending += payment.amount;
      }
      return acc;
    },
    { collected: 0, pending: 0, overdue: 0 }
  );

  if (loading) {
    return <div className="text-center py-8">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rent collection</h1>
        <p className="text-sm text-slate-600">Confirm offline payments and monitor dues.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Collected', value: `₹${stats.collected.toLocaleString()}`, delta: '+12%', good: true },
          { label: 'Pending', value: `₹${stats.pending.toLocaleString()}`, delta: 'Due soon', good: null },
          { label: 'Overdue', value: `₹${stats.overdue.toLocaleString()}`, delta: '-8%', good: false },
          { label: 'This month', value: `₹${(stats.collected + stats.pending + stats.overdue).toLocaleString()}`, delta: 'Projected', good: null },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{c.value}</p>
            <p
              className={[
                'mt-1 text-xs font-semibold',
                c.good === true ? 'text-emerald-600' : c.good === false ? 'text-rose-600' : 'text-slate-500',
              ].join(' ')}
            >
              {c.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">All payments</p>
            <p className="text-xs text-slate-500">{payments.length} transactions</p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-3 font-medium">
                    {payment.lease?.tenant?.name || 'Unknown Tenant'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {payment.lease?.property?.title || 'Unknown Property'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(payment.year, payment.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${payment.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : payment.status === 'overdue'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {payment.status === 'paid' ? (
                      <span className="text-xs font-semibold text-emerald-700">✓ Confirmed</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => confirmPayment(payment._id)}
                        disabled={confirming === payment._id}
                        className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {confirming === payment._id ? 'Confirming...' : 'Confirm payment'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

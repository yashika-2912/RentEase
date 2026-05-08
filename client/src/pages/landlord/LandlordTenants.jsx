import { FileText, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';

const rows = [
  {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    initials: 'AS',
    property: 'Skyline Heights — 12B',
    city: 'Bandra West, Mumbai',
    lease: '2024-04-01 → 2025-04-01',
    leaseTag: 'Expiring',
    rent: '₹65,000',
    rentTag: 'Overdue',
    kyc: true,
    agreement: true,
  },
  {
    name: 'Priya Iyer',
    email: 'priya@example.com',
    initials: 'PI',
    property: 'Palm Grove Villa',
    city: 'Lonavala',
    lease: '2023-11-01 → 2024-11-01',
    leaseTag: 'Active',
    rent: '₹1,20,000',
    rentTag: 'Paid',
    kyc: true,
    agreement: false,
  },
];

export default function LandlordTenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [actionMessage, setActionMessage] = useState('');

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All statuses' ||
      (statusFilter === 'Active' && r.leaseTag === 'Active') ||
      (statusFilter === 'Expiring' && r.leaseTag === 'Expiring') ||
      (statusFilter === 'Overdue' && r.rentTag === 'Overdue');

    return matchesSearch && matchesStatus;
  });

  const handleAction = (action, name) => {
    setActionMessage(`${action} for ${name}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenant directory</h1>
        <p className="text-sm text-slate-600">10 tenants · 6 active leases</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="w-full flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          placeholder="Search name, email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Expiring</option>
          <option>Overdue</option>
        </select>
      </div>

      {actionMessage && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 shadow-sm">
          {actionMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Lease</th>
                <th className="px-4 py-3">Rent / status</th>
                <th className="px-4 py-3">KYC · Agreement</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.map((r) => (
                <tr key={r.email}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {r.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{r.property}</p>
                    <p className="text-xs text-slate-500">{r.city}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-600">{r.lease}</p>
                    <span
                      className={[
                        'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                        r.leaseTag === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
                      ].join(' ')}
                    >
                      {r.leaseTag}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{r.rent}</p>
                    <span
                      className={[
                        'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                        r.rentTag === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
                      ].join(' ')}
                    >
                      {r.rentTag}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <p className={r.kyc ? 'text-emerald-700' : 'text-rose-700'}>{r.kyc ? '✅ KYC' : '❌ KYC'}</p>
                    <p className={r.agreement ? 'text-emerald-700' : 'text-rose-700'}>
                      {r.agreement ? '✅ Agreement' : '❌ Agreement'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleAction('Calling', r.name)}
                        className="rounded-full border border-slate-200 p-2 hover:bg-slate-50"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Opening chat with', r.name)}
                        className="rounded-full border border-slate-200 p-2 hover:bg-slate-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Viewing documents for', r.name)}
                        className="rounded-full border border-slate-200 p-2 hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
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

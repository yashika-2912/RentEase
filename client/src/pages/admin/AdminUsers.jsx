const rows = [
  { name: 'Aarav Sharma', email: 'aarav@example.com', role: 'tenant', status: 'Active', joined: '2024-01-12' },
  { name: 'Riya Mehta', email: 'riya@example.com', role: 'landlord', status: 'Active', joined: '2023-09-02' },
];

export default function AdminUsers() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.email}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase',
                        r.role === 'tenant'
                          ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-100'
                          : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100',
                      ].join(' ')}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-700">{r.status}</td>
                  <td className="px-4 py-3 text-slate-600">{r.joined}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-brand-600">Manage</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

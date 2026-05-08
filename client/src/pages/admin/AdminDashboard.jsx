import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Legend } from 'recharts';
import api from '../../api/axios.js';

const growth = [
  { m: 'May', users: 40 },
  { m: 'Jun', users: 55 },
  { m: 'Jul', users: 62 },
  { m: 'Aug', users: 74 },
  { m: 'Sep', users: 80 },
  { m: 'Oct', users: 92 },
];

const revenue = [
  { m: 'May', rev: 12 },
  { m: 'Jun', rev: 15 },
  { m: 'Jul', rev: 18 },
  { m: 'Aug', rev: 16 },
  { m: 'Sep', rev: 20 },
  { m: 'Oct', rev: 23 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, propertiesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/properties?approval=pending'),
        ]);
        setStats(statsRes.data);
        setPendingProperties(propertiesRes.data || []);
      } catch {
        setStats(null);
        setPendingProperties([]);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="text-sm text-slate-600">Platform-wide KPIs and approvals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Users', value: stats?.totalUsers ?? '-' },
          { label: 'Properties', value: stats?.totalProperties ?? '-' },
          { label: 'Active leases', value: stats?.activeLeases ?? '-' },
          { label: 'Monthly revenue', value: stats ? `Rs ${Number(stats.monthlyRevenue || 0).toLocaleString('en-IN')}` : '-' },
          { label: 'Pending approvals', value: stats?.pendingApprovals ?? '-' },
          { label: 'Open maintenance', value: stats?.openMaintenance ?? '-' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">User growth · 12 months</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Revenue · monthly (Rs L)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rev" name="Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Pending property approvals</h2>
          <Link to="/admin/properties" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {pendingProperties.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-slate-500">
              No pending properties right now.
            </div>
          ) : (
            pendingProperties.slice(0, 3).map((property) => (
              <div
                key={property._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-slate-900">{property.title}</span>
                  <p className="text-xs text-slate-500">
                    {property.address?.city || 'Unknown city'} - {property.landlord?.name || 'Unknown landlord'}
                  </p>
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                  Pending
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

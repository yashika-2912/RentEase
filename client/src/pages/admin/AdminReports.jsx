import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../api/axios.js';

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, reportsRes] = await Promise.all([api.get('/admin/stats'), api.get('/admin/reports')]);
        setStats(statsRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error('Failed to load admin analytics', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const revenueData = [
    { date: '20 Mar', revenue: 75000, signups: 2 },
    { date: '25 Mar', revenue: 90000, signups: 3 },
    { date: '30 Mar', revenue: 113000, signups: 4 },
    { date: '04 Apr', revenue: 98000, signups: 5 },
    { date: '09 Apr', revenue: 107000, signups: 3 },
    { date: '14 Apr', revenue: 115000, signups: 4 },
  ];

  const rentDistribution = [
    { bracket: '₹5-10k', value: 7 },
    { bracket: '₹10-20k', value: 18 },
    { bracket: '₹20-35k', value: 24 },
    { bracket: '₹35-50k', value: 16 },
    { bracket: '₹50-80k', value: 10 },
    { bracket: '₹80k-1L', value: 6 },
    { bracket: '₹1L+', value: 4 },
  ];

  const supplyData = [
    { type: '1BHK', available: 3, maintenance: 1, occupied: 12 },
    { type: '2BHK', available: 2, maintenance: 2, occupied: 8 },
    { type: '3BHK', available: 1, maintenance: 0, occupied: 5 },
    { type: 'Villa', available: 1, maintenance: 0, occupied: 3 },
    { type: 'Studio', available: 2, maintenance: 0, occupied: 1 },
    { type: 'Commercial', available: 1, maintenance: 0, occupied: 2 },
  ];

  const collectionSeries = [
    { name: '1BHK', value: 92, color: '#22c55e' },
    { name: '2BHK', value: 88, color: '#38bdf8' },
    { name: '3BHK', value: 79, color: '#f59e0b' },
    { name: 'Villa', value: 84, color: '#0ea5e9' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System analytics</h1>
        <p className="text-sm text-slate-600">Platform-wide insights for revenue, supply, and collection performance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {[
          { label: 'Total users', value: stats.totalUsers ?? 0, detail: 'This month' },
          { label: 'Properties', value: stats.totalProperties ?? 0, detail: 'Active listings' },
          { label: 'Total revenue', value: `₹${stats.monthlyRevenue?.toLocaleString() || 0}`, detail: 'Last 30 days' },
          { label: 'SLA uptime', value: '99.98%', detail: 'System availability' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Revenue trend · 30 days</h2>
              <p className="text-xs text-slate-500">Revenue vs new sign-ups</p>
            </div>
            <button type="button" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
              Export CSV
            </button>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" fill="url(#revenueGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="signups" name="Sign-ups" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Rent distribution</h2>
          <p className="text-xs text-slate-500">How rents are spread across price bands</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentDistribution} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Property supply</h2>
          <p className="text-xs text-slate-500">Available, maintenance, occupied</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="available" name="Available" fill="#22c55e" />
                <Bar dataKey="maintenance" name="Maintenance" fill="#ef4444" />
                <Bar dataKey="occupied" name="Occupied" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Network collection rate</h2>
          <p className="text-xs text-slate-500">On-time rent collection by unit type</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {collectionSeries.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-lg font-bold text-slate-900">{item.value}%</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

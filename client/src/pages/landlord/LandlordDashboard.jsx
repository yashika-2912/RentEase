import { AlertTriangle, Building2, IndianRupee, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const revenue = [
  { month: 'Nov', collected: 210000 },
  { month: 'Dec', collected: 245000 },
  { month: 'Jan', collected: 260000 },
  { month: 'Feb', collected: 238000 },
  { month: 'Mar', collected: 255000 },
  { month: 'Apr', collected: 272000 },
];

const occupancy = [
  { name: 'Occupied', value: 72 },
  { name: 'Vacant', value: 28 },
];
const COLORS = ['#10b981', '#e2e8f0'];

export default function LandlordDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-sm md:flex md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 rounded-xl bg-white p-2 text-rose-600 shadow-sm ring-1 ring-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-800">3 overdue rent payments</p>
            <p className="mt-1 text-sm text-rose-900/80">
              Total outstanding ₹1,31,500 across 3 tenants. Auto-reminders sent 2 hours ago.
            </p>
          </div>
        </div>
        <Link
          to="/landlord/payments"
          className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm ring-1 ring-rose-200 hover:bg-rose-100 md:mt-0"
        >
          Review overdue
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active listings', value: '7', hint: '+8% vs last month', icon: Building2, tone: 'text-brand-600' },
          { label: 'Occupied units', value: '5', hint: 'Stable week', icon: Users, tone: 'text-mint-600' },
          { label: 'Monthly rent roll', value: '₹3.2L', hint: '+3% vs last month', icon: IndianRupee, tone: 'text-brand-600' },
          { label: 'Open maintenance', value: '11', hint: '4 urgent', icon: Wrench, tone: 'text-amber-600' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</span>
              <span className={`rounded-xl bg-slate-50 p-2 ${c.tone}`}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Daily activity · last 30 days</h2>
              <p className="text-xs text-slate-500">Rent collected trend (₹)</p>
            </div>
            <Link to="/landlord/analytics" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View analytics →
            </Link>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" name="Rent collected" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Occupancy</h2>
          <p className="text-xs text-slate-500">Portfolio mix</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancy} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {occupancy.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

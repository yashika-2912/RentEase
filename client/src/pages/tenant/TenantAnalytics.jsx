import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import api from '../../api/axios.js';

export default function TenantAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const { data } = await api.get('/payments/tenant/analytics');
                setAnalytics(data);
            } catch (error) {
                console.error('Failed to load tenant analytics', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My analytics</h1>
                <p className="text-sm text-slate-600">Your rent and lease insights in one place.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Rent due', value: `₹${analytics.rentDue.toLocaleString()}`, note: `Next payment due in ${analytics.leaseInfo.nextPaymentDueInDays} days` },
                    { label: 'Total paid', value: `₹${analytics.totalPaid.toLocaleString()}`, note: 'Last 6 months' },
                    { label: 'On-time rate', value: `${analytics.onTimeRate}%`, note: 'Payment consistency' },
                    { label: 'Lease status', value: analytics.leaseStatus || 'Pending', note: `${analytics.leaseInfo.leaseEndsInMonths} months remaining` },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                        <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-900">Rent history</h2>
                    <p className="text-xs text-slate-500">Paid versus overdue amounts</p>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.months} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line type="monotone" dataKey="paid" name="Paid" stroke="#22c55e" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="overdue" name="Overdue" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-900">Payment status</h2>
                    <p className="text-xs text-slate-500">Payments grouped by status</p>
                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.statusCounts} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                    {analytics.statusCounts.map((entry) => (
                                        <Cell key={entry.status} fill={entry.status === 'Overdue' ? '#ef4444' : entry.status === 'Due' ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-900">Lease progress</h2>
                    <div className="mt-4 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={analytics.leaseProgress} dataKey="value" nameKey="name" innerRadius={70} outerRadius={90} paddingAngle={4}>
                                    {analytics.leaseProgress.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        {analytics.leaseProgress.map((slice) => (
                            <div key={slice.name} className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                                <span>{slice.name}</span>
                                <span className="ml-auto text-slate-900 font-semibold">{slice.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h2 className="text-sm font-semibold text-slate-900">Balance summary</h2>
                    <p className="text-xs text-slate-500">Key payment milestones and reminders</p>
                    <div className="mt-6 space-y-4 text-sm text-slate-600">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">Next payment due</p>
                            <p className="mt-2">₹{analytics.leaseInfo.dueAmount.toLocaleString()} due in {analytics.leaseInfo.nextPaymentDueInDays} days. Please coordinate with your landlord for offline confirmation.</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">Lease renewals</p>
                            <p className="mt-2">Your lease is in good standing and expires in {analytics.leaseInfo.leaseEndsInMonths} months. Renew early to lock current rent.</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">Payment habits</p>
                            <p className="mt-2">Your on-time payment rate is {analytics.onTimeRate}%, with {analytics.statusCounts.find((s) => s.status === 'Overdue')?.count || 0} overdue month(s) in recent history.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

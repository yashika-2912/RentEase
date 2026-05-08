import { Link } from 'react-router-dom';
import { ArrowRight, Building2, KeyRound, LineChart, ShieldCheck, Sparkles } from 'lucide-react';
import { LogoWordmark } from '../../components/Logo.jsx';

function FloatingCard({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-float backdrop-blur animate-floaty ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-mint-500/15 blur-3xl animate-floaty" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-6">
        <LogoWordmark />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-6 md:grid-cols-2 md:items-center md:px-6 md:pt-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            Smart matching for tenants
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Manage rentals with <span className="text-brand-600">clarity</span> and{' '}
            <span className="text-mint-600">confidence</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            RentEase connects tenants, landlords, and administrators on one light, modern workspace — from lease
            tracking and rent collection to maintenance workflows and real-time messaging.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-mint-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-105"
            >
              Create an account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              View dashboard login
            </Link>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</dt>
              <dd className="mt-1 font-semibold text-slate-900">3 dashboards</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</dt>
              <dd className="mt-1 font-semibold text-slate-900">Stripe-ready</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Realtime</dt>
              <dd className="mt-1 font-semibold text-slate-900">Socket.io</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden h-[420px] md:block">
          <FloatingCard className="absolute left-4 top-6 w-56">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-brand-600" />
              Portfolio pulse
            </div>
            <p className="mt-2 text-xs text-slate-600">Occupancy, rent health, and tickets — unified.</p>
          </FloatingCard>
          <FloatingCard className="absolute right-2 top-24 w-52 animate-drift" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <KeyRound className="h-4 w-4 text-mint-600" />
              Digital leases
            </div>
            <p className="mt-2 text-xs text-slate-600">Renewals, notices, and e-sign ready flows.</p>
          </FloatingCard>
          <FloatingCard className="absolute bottom-10 left-10 w-60" style={{ animationDelay: '1.2s' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <LineChart className="h-4 w-4 text-brand-600" />
              Revenue analytics
            </div>
            <p className="mt-2 text-xs text-slate-600">Recharts-powered insights for landlords & admins.</p>
          </FloatingCard>
          <FloatingCard className="absolute bottom-24 right-6 w-48" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-mint-600" />
              Admin guardrails
            </div>
            <p className="mt-2 text-xs text-slate-600">Approvals, audits, and operational controls.</p>
          </FloatingCard>
        </div>
      </main>

      <section className="relative z-10 border-t border-slate-200 bg-white/70 py-14 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:px-6">
          {[
            {
              title: 'Tenants',
              body: 'Smart Match ranks homes to your budget, city, bedrooms, amenities, and commute preferences.',
              icon: Sparkles,
            },
            {
              title: 'Landlords',
              body: 'List properties, track leases, collect rent, resolve maintenance, and message tenants in one hub.',
              icon: Building2,
            },
            {
              title: 'Administrators',
              body: 'Moderate listings, oversee users, monitor revenue, and export operational reports.',
              icon: ShieldCheck,
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="inline-flex rounded-xl bg-white p-2 text-brand-600 shadow-sm ring-1 ring-slate-100">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

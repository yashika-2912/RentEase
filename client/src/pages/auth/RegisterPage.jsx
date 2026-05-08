import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoWordmark } from '../../components/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'tenant',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      const target = user.role === 'tenant' ? '/tenant' : user.role === 'landlord' ? '/landlord' : '/admin';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-mint-50">
      <div className="pointer-events-none absolute -right-10 top-20 h-72 w-72 rounded-full bg-mint-500/20 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute bottom-24 left-0 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl animate-drift" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-float backdrop-blur-md">
          <LogoWordmark />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Join as a tenant or landlord — admins are provisioned separately.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input
                type="password"
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-brand-600 to-mint-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoWordmark } from '../../components/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      const target =
        location.state?.from ||
        (user.role === 'tenant' ? '/tenant' : user.role === 'landlord' ? '/landlord' : '/admin');
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <div className="pointer-events-none absolute left-10 top-32 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-mint-500/20 blur-3xl animate-drift" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16 md:px-8">
        <div className="mb-10 hidden flex-1 md:block">
          <div className="relative h-80">
            <div className="absolute left-0 top-0 w-56 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-float backdrop-blur animate-floaty">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Secure access</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">JWT access + refresh tokens</p>
              <p className="mt-2 text-xs text-slate-600">Session-friendly auth wired to the MERN API.</p>
            </div>
            <div
              className="absolute bottom-6 right-4 w-52 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-float backdrop-blur animate-drift"
              style={{ animationDelay: '0.6s' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-mint-600">Realtime</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Socket.io messaging</p>
              <p className="mt-2 text-xs text-slate-600">Chat bubbles sync as soon as you send.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-float backdrop-blur-md md:mx-0">
          <LogoWordmark />
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to continue to your RentEase workspace.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500/20 focus:border-brand-500 focus:ring-4"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-brand-600 to-mint-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

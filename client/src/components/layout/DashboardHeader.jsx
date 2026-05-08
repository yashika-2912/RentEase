import { Bell, ChevronRight, Home, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function DashboardHeader({ breadcrumbs = [], onMenu }) {
  const { user } = useAuth();

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
        <button
          type="button"
          className="mr-1 inline-flex rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Home className="h-4 w-4" />
        </button>
        <Home className="hidden h-4 w-4 text-slate-400 md:inline" />
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="flex min-w-0 items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
            {crumb.to ? (
              <Link to={crumb.to} className="truncate hover:text-brand-600">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-xl md:mx-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search properties, tenants, payments..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none ring-brand-500/30 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
        <button
          type="button"
          className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            4
          </span>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-mint-500 text-sm font-bold text-white shadow-md ring-2 ring-white">
          {(user?.name || 'R').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

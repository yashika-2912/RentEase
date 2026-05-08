import { NavLink } from 'react-router-dom';
import { LogoWordmark } from '../Logo.jsx';

function NavSection({ title, items, onNavigate }) {
  return (
    <div className="mb-6">
      <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}>
            {({ isActive }) => (
              <span
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-lg border bg-white shadow-sm',
                    isActive ? 'border-brand-200 text-brand-600' : 'border-slate-200 text-slate-500',
                  ].join(' ')}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function DashboardSidebar({ role, sections, onNavigate }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-5">
        <LogoWordmark />
        <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          {role === 'tenant' && 'Tenant'}
          {role === 'landlord' && 'Landlord'}
          {role === 'admin' && 'Admin'}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((s) => (
          <NavSection key={s.title} title={s.title} items={s.items} onNavigate={onNavigate} />
        ))}
      </div>
      <div className="space-y-1 border-t border-slate-100 px-4 py-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            Payment Gateway: <span className="font-medium text-emerald-600">Connected</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            Notifications: <span className="font-medium text-emerald-600">Running</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>
            SLA: <span className="font-semibold text-amber-700">99.98%</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

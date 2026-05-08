import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StatusBar } from '../components/layout/StatusBar.jsx';
import { DashboardHeader } from '../components/layout/DashboardHeader.jsx';
import { DashboardSidebar } from '../components/layout/DashboardSidebar.jsx';
import { navByRole } from '../nav/dashboardNav.jsx';

function titleCase(s) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function breadcrumbsFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'RentEase', to: '/' }];
  if (!segments.length) return crumbs;
  const roleKey = segments[0];
  const roleLabel = roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
  crumbs.push({ label: roleLabel, to: `/${roleKey}` });
  if (segments.length === 1) {
    crumbs.push({ label: 'Dashboard', to: null });
    return crumbs;
  }
  const leaf = segments[segments.length - 1];
  crumbs.push({ label: titleCase(leaf), to: null });
  return crumbs;
}

export function DashboardShell({ role }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = useMemo(() => breadcrumbsFromPath(location.pathname), [location.pathname]);

  const sections = navByRole[role] || navByRole.tenant;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <StatusBar />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={[
            'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white shadow-lg transition md:static md:translate-x-0 md:shadow-none',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <DashboardSidebar
            role={role}
            sections={sections}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader breadcrumbs={breadcrumbs} onMenu={() => setMobileOpen(true)} />
          <main className="grid-bg flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

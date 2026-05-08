import { Activity, Building2, IndianRupee, Ticket, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 md:px-6">
      <div className="flex items-center gap-2 font-semibold text-slate-800">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        LIVE <span className="font-mono text-slate-500">{time}</span>
      </div>
      <div className="flex items-center gap-1.5 text-emerald-600">
        <Wifi className="h-3.5 w-3.5" />
        <span className="font-medium">WebSocket Connected</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-brand-600" />
        <span>
          Active Listings <span className="font-semibold text-slate-900">47</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-rose-600">
        <IndianRupee className="h-3.5 w-3.5" />
        <span>
          Overdue Rents <span className="font-semibold">₹2.8L</span>
          <span className="text-slate-500"> · 4 tenants</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-amber-600">
        <Ticket className="h-3.5 w-3.5" />
        <span>
          Open Tickets <span className="font-semibold text-slate-900">11</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-mint-600" />
        <span>
          Today&apos;s Collection <span className="font-semibold text-slate-900">₹4,22,500</span>
        </span>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-600">Platform configuration (site name, Stripe mode, SMTP, SLA).</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Site name</span>
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="RentEase" />
          </label>
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Support phone</span>
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="+91 …" />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Contact email</span>
            <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="support@…" />
          </label>
        </div>
        <button type="button" className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Save settings
        </button>
      </div>
    </div>
  );
}

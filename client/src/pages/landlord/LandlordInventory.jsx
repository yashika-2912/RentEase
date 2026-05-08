import { useState } from 'react';

export default function LandlordInventory() {
  const [rows, setRows] = useState([
    { name: 'Paint buckets', current: 85, min: 50, ok: true },
    { name: 'PVC pipes', current: 12, min: 20, ok: false },
    { name: 'LED bulbs', current: 120, min: 40, ok: true },
  ]);
  const [reorderedItem, setReorderedItem] = useState('');

  const handleReorder = (itemName) => {
    setRows((prev) => prev.map((row) =>
      row.name === itemName ? { ...row, current: row.current + row.min, ok: true } : row
    ));
    setReorderedItem(itemName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance inventory</h1>
        <p className="text-sm text-slate-600">Tools, materials & spare parts across all properties.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Stock levels</h2>
          <p className="text-xs text-slate-500">Current inventory with 5-day trend</p>
          <div className="mt-4 space-y-4">
            {rows.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{r.name}</span>
                  <span>
                    {r.current} / min {r.min}
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100">
                  <div
                    className={['h-3 rounded-full', r.ok ? 'bg-emerald-500' : 'bg-rose-500'].join(' ')}
                    style={{ width: `${Math.min(100, (r.current / (r.min * 2)) * 100)}%` }}
                  />
                </div>
                {!r.ok && (
                  <span className="mt-1 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                    Low
                  </span>
                )}
                {!r.ok && (
                  <button
                    type="button"
                    onClick={() => handleReorder(r.name)}
                    className="mt-3 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase text-white hover:bg-rose-700"
                  >
                    Reorder
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Low stock alerts</h2>
          <p className="text-xs text-slate-500">3 items below threshold</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-900">
              <p className="font-semibold">Paint buckets</p>
              <p className="text-xs">12 left — need 20</p>
              <button
                type="button"
                onClick={() => handleReorder('Paint buckets')}
                className="mt-2 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase text-white"
              >
                Reorder
              </button>
            </div>
          </div>
        </div>
      </div>
      {reorderedItem && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          Reorder requested for {reorderedItem}. Stock levels updated.
        </div>
      )}
    </div>
  );
}

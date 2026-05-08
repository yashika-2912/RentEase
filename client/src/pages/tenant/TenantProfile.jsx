import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

const amenities = ['parking', 'gym', 'wifi', 'ac', 'pet-friendly', 'pool', 'security', 'power backup'];

export default function TenantProfile() {
  const { user, refreshUser } = useAuth();
  const [prefs, setPrefs] = useState({
    budget: { min: 15000, max: 80000 },
    preferredLocations: ['Mumbai'],
    bedrooms: 2,
    amenities: ['parking', 'gym'],
    furnished: true,
    maxCommute: 8,
  });
  const [cityInput, setCityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user?.preferences) return;
    const pr = user.preferences;
    setPrefs({
      budget: { min: pr.budget?.min ?? 15000, max: pr.budget?.max ?? 80000 },
      preferredLocations: pr.preferredLocations?.length ? pr.preferredLocations : ['Mumbai'],
      bedrooms: pr.bedrooms ?? 2,
      amenities: pr.amenities?.length ? pr.amenities : ['parking', 'gym'],
      furnished: !!pr.furnished,
      maxCommute: pr.maxCommute ?? 8,
    });
  }, [user]);

  async function savePreferences(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/users/preferences', prefs);
      await refreshUser();
      setMsg('Preferences saved for Smart Match.');
    } catch {
      setMsg('Could not save preferences (are you logged in as a tenant?).');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-600">Avatar, contact details, and Smart Match preferences.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-mint-500 text-xl font-bold text-white">
            {(user?.name || 'U').slice(0, 1)}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={savePreferences} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Smart Match preferences</h2>
          <span className="text-xs text-slate-500">PUT /api/users/preferences</span>
        </div>
        {msg && <p className="text-sm text-mint-700">{msg}</p>}
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Budget range (₹)</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input
              type="number"
              value={prefs.budget.min}
              onChange={(e) => setPrefs({ ...prefs, budget: { ...prefs.budget, min: Number(e.target.value) } })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={prefs.budget.max}
              onChange={(e) => setPrefs({ ...prefs, budget: { ...prefs.budget, max: Number(e.target.value) } })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Preferred cities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {prefs.preferredLocations.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
                {c}
                <button
                  type="button"
                  className="text-brand-500 hover:text-brand-700"
                  onClick={() =>
                    setPrefs({ ...prefs, preferredLocations: prefs.preferredLocations.filter((x) => x !== c) })
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Add city"
            />
            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              onClick={() => {
                if (!cityInput.trim()) return;
                setPrefs({ ...prefs, preferredLocations: [...prefs.preferredLocations, cityInput.trim()] });
                setCityInput('');
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">Bedrooms</label>
          <input
            type="number"
            min={0}
            value={prefs.bedrooms}
            onChange={(e) => setPrefs({ ...prefs, bedrooms: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={prefs.furnished}
            onChange={(e) => setPrefs({ ...prefs, furnished: e.target.checked })}
          />
          Furnished required
        </label>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Amenities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    amenities: prefs.amenities.includes(a)
                      ? prefs.amenities.filter((x) => x !== a)
                      : [...prefs.amenities, a],
                  })
                }
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold ring-1',
                  prefs.amenities.includes(a)
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-slate-50 text-slate-700 ring-slate-200',
                ].join(' ')}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500">Max commute (km)</label>
          <input
            type="number"
            value={prefs.maxCommute}
            onChange={(e) => setPrefs({ ...prefs, maxCommute: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-gradient-to-r from-brand-600 to-mint-600 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </form>
    </div>
  );
}

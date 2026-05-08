import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import api from '../../api/axios.js';
import { MapPreview } from '../../components/MapPreview.jsx';

const amenityOptions = ['parking', 'gym', 'wifi', 'ac', 'pet-friendly', 'pool', 'security', 'power backup'];

function matchBadgeClass(score) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (score >= 60) return 'bg-brand-50 text-brand-700 ring-brand-100';
  if (score >= 40) return 'bg-amber-50 text-amber-800 ring-amber-100';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

export default function BrowseProperties() {
  const [smart, setSmart] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [savingPropertyId, setSavingPropertyId] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
    furnished: false,
    amenities: [],
    sort: 'newest',
  });

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const response = await api.get('/users/saved-properties');
      const savedIds = new Set((response.data || []).map(p => p._id));
      setSavedProperties(savedIds);
    } catch (error) {
      console.error('Failed to fetch saved properties:', error);
    }
  };

  const toggleSaveProperty = async (e, propertyId) => {
    e.stopPropagation();
    setSavingPropertyId(propertyId);
    try {
      const response = await api.post(`/users/saved-properties/${propertyId}`);
      if (response.data.isSaved) {
        setSavedProperties(new Set([...savedProperties, propertyId]));
      } else {
        setSavedProperties(new Set([...savedProperties].filter(id => id !== propertyId)));
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    } finally {
      setSavingPropertyId(null);
    }
  };

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.city) p.set('city', filters.city);
    if (filters.minRent) p.set('minRent', filters.minRent);
    if (filters.maxRent) p.set('maxRent', filters.maxRent);
    if (filters.bedrooms) p.set('bedrooms', filters.bedrooms);
    if (filters.furnished) p.set('furnished', 'true');
    if (filters.amenities.length) p.set('amenities', filters.amenities.join(','));
    const sortKey =
      filters.sort === 'price_low' ? 'price_asc' : filters.sort === 'price_high' ? 'price_desc' : 'newest';
    p.set('sort', sortKey);
    return p.toString();
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const url = smart ? `/properties/smart-match?${query}` : `/properties?${query}`;
        const { data } = await api.get(url);
        let list = data;
        if (smart && filters.sort === 'match') {
          list = [...data].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) {
          setItems([
            {
              _id: 'demo-1',
              title: 'Skyline Heights — 12B',
              type: 'apartment',
              rent: 65000,
              bedrooms: 2,
              area: 980,
              address: { city: 'Mumbai' },
              amenities: ['gym', 'parking'],
              images: [],
              matchScore: 92,
            },
            {
              _id: 'demo-2',
              title: 'Urban Nest Studio',
              type: 'studio',
              rent: 22000,
              bedrooms: 1,
              area: 420,
              address: { city: 'Pune' },
              amenities: ['wifi', 'security'],
              matchScore: 74,
            },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [smart, query]);

  function toggleAmenity(a) {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse properties</h1>
          <p className="text-sm text-slate-600">{loading ? 'Loading matches…' : `${items.length} matching results`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSmart((s) => !s)}
            className={[
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition',
              smart
                ? 'bg-gradient-to-r from-brand-600 to-mint-600 text-white ring-transparent'
                : 'bg-white text-slate-800 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            <Brain className="h-4 w-4" />
            Smart Match {smart ? 'On' : 'Off'}
          </button>
          <Link to="/tenant/profile" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Set my preferences →
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900 shadow-sm">
        <span className="font-semibold">Smart Match</span> ranks listings using your saved profile (budget, cities,
        bedrooms, amenities, furnished). Toggle on to call{' '}
        <code className="rounded bg-white/70 px-1 py-0.5 text-xs">GET /api/properties/smart-match</code>.
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Filters
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">City</label>
            <input
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Mumbai, Pune…"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Min ₹</label>
              <input
                value={filters.minRent}
                onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Max ₹</label>
              <input
                value={filters.maxRent}
                onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Bedrooms</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.furnished}
              onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
            />
            Furnished
          </label>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Amenities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {amenityOptions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium ring-1',
                    filters.amenities.includes(a)
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Sort by</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price · Low to High</option>
              <option value="price_high">Price · High to Low</option>
              {smart && <option value="match">Best Match Score</option>}
            </select>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
                placeholder="Search by city, area, name…"
              />
            </div>
            <select className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
              <option>All types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Studio</option>
              <option>Villa</option>
              <option>PG</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <article
                key={p._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-800 ring-1 ring-slate-200">
                      {p.type}
                    </span>
                    {p.isAvailable === false ? (
                      <span className="rounded-full bg-brand-600/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Occupied
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Available
                      </span>
                    )}
                  </div>
                  <div className="absolute right-3 top-3 flex gap-2">
                    {smart && typeof p.matchScore === 'number' && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${matchBadgeClass(p.matchScore)}`}
                      >
                        ⚡ {p.matchScore}% match
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => toggleSaveProperty(e, p._id)}
                      disabled={savingPropertyId === p._id}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow ring-1 transition ${savedProperties.has(p._id)
                          ? 'bg-red-50 text-red-500 ring-red-200'
                          : 'bg-white/90 text-slate-400 ring-slate-200 hover:bg-white'
                        } disabled:opacity-50`}
                    >
                      <Heart className={`h-4 w-4 ${savedProperties.has(p._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.address?.city || 'City'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">{p.bedrooms} bed</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-100">{p.area} sqft</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(p.amenities || []).slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Monthly</p>
                      <p className="text-lg font-bold text-brand-700">₹{Number(p.rent).toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModal(p)}
                      className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 md:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{modal.title}</h3>
                <p className="text-sm text-slate-600">{modal.description || 'Premium residence with modern finishes.'}</p>
              </div>
              <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setModal(null)}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Rent:</span> ₹{Number(modal.rent).toLocaleString('en-IN')}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Deposit:</span> ₹{Number(modal.deposit || 0).toLocaleString('en-IN')}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Bed / Bath:</span> {modal.bedrooms} / {modal.bathrooms}
                </p>
              </div>
              <MapPreview lat={modal.address?.coordinates?.lat} lng={modal.address?.coordinates?.lng} height={200} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

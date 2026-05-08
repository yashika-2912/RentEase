import { Building2, CalendarClock, MessageCircle, Wrench, Heart, MapPin, Bed, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPreview } from '../../components/MapPreview.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      setLoadingSaved(true);
      const response = await api.get('/users/saved-properties');
      setSavedProperties(response.data || []);
    } catch (error) {
      console.error('Failed to fetch saved properties:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    { label: 'Browse properties', to: '/tenant/browse' },
    { label: 'My lease', to: '/tenant/lease' },
    { label: 'Maintenance', to: '/tenant/maintenance' },
    { label: 'Messages', to: '/tenant/messages' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back to your tenant dashboard.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.to)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Monthly rent', value: '₹65,000', icon: CalendarClock, tone: 'text-brand-600' },
          { label: 'Lease status', value: 'Expiring', icon: CalendarClock, tone: 'text-amber-600' },
          { label: 'Open tickets', value: '1', icon: Wrench, tone: 'text-slate-700' },
          { label: 'Saved listings', value: String(savedProperties.length), icon: Building2, tone: 'text-mint-600' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</span>
              <span className={`rounded-xl bg-slate-50 p-2 ${c.tone}`}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Lease renewal offer</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Renew at Skyline Heights — 12B</h2>
              <p className="mt-2 text-sm text-slate-600">
                12‑month renewal with locked rent and priority maintenance response window.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time remaining</p>
              <p className="mt-1 font-mono text-2xl font-bold text-brand-700">01:59:08</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/tenant/notifications')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenant/lease')}
              className="rounded-full bg-gradient-to-r from-brand-600 to-mint-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105"
            >
              Accept renewal
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">How payments work</h2>
            <MessageCircle className="h-4 w-4 text-slate-400" />
          </div>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">1.</span> Make your rent payment directly to your landlord.
            </li>
            <li>
              <span className="font-semibold text-slate-900">2.</span> Landlord will confirm receipt in the system.
            </li>
            <li>
              <span className="font-semibold text-slate-900">3.</span> You'll receive confirmation and receipt via email.
            </li>
          </ol>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Property location</h2>
          <p className="mt-1 text-xs text-slate-500">Read-only map preview of your current lease.</p>
          <div className="mt-4">
            <MapPreview />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Recent notifications</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {['Rent reminder sent', 'Maintenance update: tap repair scheduled', 'New message from landlord'].map(
              (n) => (
                <li key={n} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                  <span className="text-slate-700">{n}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">❤️ Saved properties</h2>
            <p className="mt-1 text-xs text-slate-500">Your heart-marked favorite listings</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tenant/browse')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Browse more
          </button>
        </div>

        {loadingSaved ? (
          <div className="mt-4 text-center text-sm text-slate-500">Loading saved properties...</div>
        ) : savedProperties.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <Heart className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-600">No saved properties yet</p>
            <p className="text-xs text-slate-500 mt-1">Heart-mark properties while browsing to save them here</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.slice(0, 6).map((property) => (
              <div
                key={property._id}
                onClick={() => navigate(`/property/${property._id}`)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-md transition"
              >
                <div className="relative h-32 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchSavedProperties();
                    }}
                    className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow-sm hover:bg-slate-50"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-900 truncate text-sm">{property.title}</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.address?.city || 'City'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{property.bedrooms} BHK</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-brand-600 font-semibold">
                    <DollarSign className="h-3 w-3" />
                    <span>₹{property.rent?.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {savedProperties.length > 6 && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/tenant/browse')}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all {savedProperties.length} saved properties →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

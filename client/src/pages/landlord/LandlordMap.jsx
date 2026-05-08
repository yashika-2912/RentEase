import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

const pins = [
  { title: 'Skyline Heights — 12B', lat: 19.0544, lng: 72.8406 },
  { title: 'Urban Nest Studio', lat: 18.5362, lng: 73.8933 },
];

export default function LandlordMap() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Map view</h1>
        <p className="text-sm text-slate-600">React-Leaflet map with property pins.</p>
      </div>
      <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer center={[19.076, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pins.map((p) => (
            <Marker key={p.title} position={[p.lat, p.lng]}>
              <Popup>{p.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

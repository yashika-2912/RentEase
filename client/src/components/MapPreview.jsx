import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker assets with Vite
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

export function MapPreview({ lat = 19.0544, lng = 72.8406, height = 220 }) {
  const center = [lat, lng];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}

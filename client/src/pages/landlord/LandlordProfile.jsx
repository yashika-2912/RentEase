import { useAuth } from '../../context/AuthContext.jsx';

export default function LandlordProfile() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Signed in as</p>
        <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
        <p className="text-sm text-slate-600">{user?.email}</p>
      </div>
    </div>
  );
}

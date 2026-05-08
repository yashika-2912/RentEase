
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/axios';

const categoryOptions = [
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Electrical', value: 'electrical' },
  { label: 'Appliance', value: 'appliance' },
  { label: 'Structural', value: 'structural' },
  { label: 'Other', value: 'other' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Emergency', value: 'urgent' },
];

export default function TenantMaintenance() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaseProperty, setLeaseProperty] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'plumbing',
    priority: 'low',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch maintenance requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/tenant/mine');
      setRequests(res.data);
    } catch (err) {
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    async function fetchLeaseProperty() {
      try {
        const res = await api.get('/leases/tenant/mine');
        const leases = res.data || [];
        const activeLease = leases.find((lease) => lease.status === 'active') || leases[0] || null;
        setLeaseProperty(activeLease?.property || null);
      } catch {
        setLeaseProperty(null);
      }
    }

    fetchLeaseProperty();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!leaseProperty?._id) {
      setSubmitError('No leased property was found for your account. Please contact support or your landlord.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/maintenance', { ...form, property: leaseProperty._id });
      setShowNewRequest(false);
      setForm({ title: '', category: 'plumbing', priority: 'low', description: '' });
      fetchRequests();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Unable to submit maintenance request');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-sm text-slate-600">Raise tickets with photos; track status in real time.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewRequest(true)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New request
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-3 text-center">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-3 text-center">No maintenance requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-3 font-medium text-slate-900">{req.title}</td>
                    <td className="px-6 py-3 text-slate-600">{req.category}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${req.priority === 'high' || req.priority === 'urgent' ? 'bg-rose-50 text-rose-700' : req.priority === 'medium' ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>{req.priority}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${req.status === 'resolved' ? 'bg-green-50 text-green-700' : req.status === 'in-progress' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>{req.status}</span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">New Maintenance Request</h3>
            {leaseProperty ? (
              <p className="mt-1 text-sm text-slate-500">For {leaseProperty.title || 'your current property'}</p>
            ) : (
              <p className="mt-1 text-sm text-amber-600">A current lease is required before you can submit a request.</p>
            )}
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  required
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="Detailed description of the issue"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewRequest(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  disabled={submitting || !leaseProperty?._id}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

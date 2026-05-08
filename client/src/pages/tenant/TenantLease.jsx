import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, FileText, MessageCircle, Phone, RefreshCw, X } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TenantLease() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [renewalRequested, setRenewalRequested] = useState(false);
  const [lease, setLease] = useState(null);
  const [allLeases, setAllLeases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    fetchLeaseData();
    // eslint-disable-next-line
  }, []);

  const fetchLeaseData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leases/tenant/mine');
      setAllLeases(response.data || []);
      if (response.data && response.data.length > 0) {
        const activeLease = response.data.find(l => l.status === 'active') || response.data[0];
        setLease(activeLease);
        setDocuments(activeLease.documents || []);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = (docUrl, index) => {
    try {
      const link = document.createElement('a');
      link.href = docUrl;
      link.target = '_blank';
      link.download = `lease-document-${index + 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // handle error
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const calculateLeaseProgress = () => {
    if (!lease) return 0;
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My lease</h1>
          <p className="text-sm text-slate-600">Lease documents, renewal, and history.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-500">
          Loading lease information...
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My lease</h1>
          <p className="text-sm text-slate-600">Lease documents, renewal, and history.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center text-slate-500">
          No active lease found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My lease</h1>
        <p className="text-sm text-slate-600">Lease documents, renewal, and history.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Active lease</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{lease.property?.title || 'Property'}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Landlord: <span className="font-medium text-slate-900">{lease.landlord?.name}</span> ·{' '}
              <span className="inline-flex items-center gap-1 text-brand-700">
                <Phone className="h-3.5 w-3.5" />
                {lease.landlord?.phone || '+91 XXXXXXXXXX'}
              </span>
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-xs uppercase text-slate-500">Start</p>
                <p className="font-semibold text-slate-900">{formatDate(lease.startDate)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-xs uppercase text-slate-500">End</p>
                <p className="font-semibold text-slate-900">{formatDate(lease.endDate)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-xs uppercase text-slate-500">Monthly rent</p>
                <p className="font-semibold text-brand-700">₹{lease.monthlyRent?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={documents.length === 0}
              onClick={() => documents.length > 0 && downloadDocument(documents[0], 0)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${documents.length === 0
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => setRenewalRequested(true)}
              disabled={renewalRequested}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${renewalRequested
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
            >
              <RefreshCw className="h-4 w-4" />
              {renewalRequested ? 'Renewal requested' : 'Request renewal'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenant/messages')}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Landlord
            </button>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Lease progress</span>
            <span>{Math.round(calculateLeaseProgress())}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-mint-500 transition-all"
              style={{ width: `${calculateLeaseProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Lease Documents</h3>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Lease Document {index + 1}
                    </p>
                    <p className="text-xs text-slate-500">PDF Document</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingDoc(doc)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-200 hover:bg-brand-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadDocument(doc, index)}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Lease Document Viewer</h3>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="rounded-lg hover:bg-slate-100 p-1"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50">
              <iframe
                src={`${viewingDoc}#toolbar=1`}
                title="Lease Document"
                className="w-full h-full border-0"
              />
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => downloadDocument(viewingDoc, 0)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Lease history</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Rent</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allLeases.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-3 text-center text-slate-500">
                    No lease history available
                  </td>
                </tr>
              ) : (
                allLeases.map((l) => (
                  <tr key={l._id}>
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {l.property?.title || 'Unknown Property'}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {formatDate(l.startDate)} → {formatDate(l.endDate)}
                    </td>
                    <td className="px-6 py-3 text-slate-900">₹{l.monthlyRent?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          l.status === 'expired' ? 'bg-slate-100 text-slate-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

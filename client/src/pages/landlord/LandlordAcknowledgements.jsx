import { AlertCircle, CheckCircle2, Clock3, MessageCircle, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

function formatDate(value) {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function firstName(name) {
  return name?.split(' ')?.[0] || 'there';
}

export default function LandlordAcknowledgements() {
  const [conversations, setConversations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [conversationRes, ticketRes] = await Promise.all([
        api.get('/messages/conversations'),
        api.get('/maintenance/landlord/mine'),
      ]);
      setConversations(conversationRes.data || []);
      setTickets(ticketRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load acknowledgements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const tenantConversationsNeedingAck = useMemo(
    () =>
      conversations.filter(
        (item) =>
          item.other?.role === 'tenant' &&
          (item.unread > 0 || String(item.lastMessage?.sender) === String(item.other?._id))
      ),
    [conversations]
  );

  const openMaintenance = useMemo(
    () => tickets.filter((ticket) => ['open', 'in-progress'].includes(ticket.status)),
    [tickets]
  );

  const cards = [
    {
      label: 'Pending conversations',
      value: tenantConversationsNeedingAck.length,
      tone: 'text-brand-700',
      icon: MessageCircle,
    },
    {
      label: 'Unread tenant messages',
      value: tenantConversationsNeedingAck.reduce((sum, item) => sum + (item.unread || 0), 0),
      tone: 'text-amber-700',
      icon: AlertCircle,
    },
    {
      label: 'Open maintenance',
      value: openMaintenance.filter((ticket) => ticket.status === 'open').length,
      tone: 'text-rose-700',
      icon: Wrench,
    },
    {
      label: 'Already in progress',
      value: openMaintenance.filter((ticket) => ticket.status === 'in-progress').length,
      tone: 'text-emerald-700',
      icon: CheckCircle2,
    },
  ];

  async function acknowledgeConversation(item) {
    const key = `conversation:${item.conversationId}`;
    setBusyKey(key);
    try {
      await api.get(`/messages/${item.conversationId}`);
      await api.post('/messages/send', {
        receiverId: item.other._id,
        content: `Hi ${firstName(item.other?.name)}, I've seen your message and I'll follow up shortly.`,
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to acknowledge message');
    } finally {
      setBusyKey('');
    }
  }

  async function acknowledgeTicket(ticket) {
    const key = `ticket:${ticket._id}`;
    setBusyKey(key);
    try {
      const internalNotes = [ticket.internalNotes, 'Acknowledged by landlord from dashboard.']
        .filter(Boolean)
        .join(' ');
      await api.put(`/maintenance/${ticket._id}/status`, {
        status: 'in-progress',
        internalNotes,
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to acknowledge maintenance request');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acknowledgements</h1>
          <p className="text-sm text-slate-600">
            Review tenant messages and open requests that still need a landlord response.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.tone}`} />
            </div>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Tenant conversations</h2>
              <p className="text-xs text-slate-500">Unread or last-replied-by-tenant threads that still need a touchpoint.</p>
            </div>
            <Link to="/landlord/messages" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Open inbox
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading conversations...
              </div>
            ) : tenantConversationsNeedingAck.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-3 text-sm font-semibold text-slate-900">No pending acknowledgements</p>
                <p className="mt-1 text-sm text-slate-500">Tenant conversations are all caught up for now.</p>
              </div>
            ) : (
              tenantConversationsNeedingAck.map((item) => (
                <article key={item.conversationId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{item.other?.name || 'Tenant'}</h3>
                        {item.unread > 0 && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            {item.unread} unread
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.other?.email || 'No email available'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(item.lastMessage?.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 rounded-xl bg-white px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-100">
                    {item.lastMessage?.content || 'No message preview available.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => acknowledgeConversation(item)}
                      disabled={busyKey === `conversation:${item.conversationId}`}
                      className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busyKey === `conversation:${item.conversationId}` ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                    <Link
                      to="/landlord/messages"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      View thread
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Maintenance needing response</h2>
              <p className="text-xs text-slate-500">Open tenant-reported issues that should be acknowledged quickly.</p>
            </div>
            <Link to="/landlord/maintenance" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Open queue
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading maintenance requests...
              </div>
            ) : openMaintenance.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-3 text-sm font-semibold text-slate-900">No open items</p>
                <p className="mt-1 text-sm text-slate-500">All current maintenance requests are already resolved.</p>
              </div>
            ) : (
              openMaintenance.map((ticket) => (
                <article key={ticket._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 ring-1 ring-slate-200">
                          {ticket.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            ticket.priority === 'urgent' || ticket.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                              : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 ring-1 ring-slate-200">
                          {ticket.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-900">{ticket.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{ticket.description}</p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(ticket.createdAt)}</span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    {ticket.property?.title || 'Property unavailable'} {' - '} {ticket.tenant?.name || 'Tenant unavailable'}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => acknowledgeTicket(ticket)}
                      disabled={ticket.status === 'in-progress' || busyKey === `ticket:${ticket._id}`}
                      className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busyKey === `ticket:${ticket._id}`
                        ? 'Updating...'
                        : ticket.status === 'in-progress'
                          ? 'Acknowledged'
                          : 'Acknowledge request'}
                    </button>
                    <Link
                      to="/landlord/maintenance"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Manage ticket
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import { adminApi } from './api';

function formatTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function statusStyle(status) {
  const normalized = String(status || 'new').toLowerCase();
  if (normalized === 'done') {
    return {
      background: 'rgba(38,132,86,0.16)',
      color: '#63E6A8',
      border: '1px solid rgba(99,230,168,0.35)',
    };
  }
  if (normalized === 'pending') {
    return {
      background: 'rgba(168,126,47,0.16)',
      color: '#F4D08F',
      border: '1px solid rgba(244,208,143,0.35)',
    };
  }
  return {
    background: 'rgba(75,121,184,0.16)',
    color: '#A6CBF5',
    border: '1px solid rgba(166,203,245,0.35)',
  };
}

function staleLabel(hours) {
  if (hours === null || hours === undefined) return 'Unknown';
  if (hours < 24) return `${Math.round(hours)}h old`;
  if (hours < 72) return `${(hours / 24).toFixed(1)}d old`;
  return `${Math.round(hours / 24)}d old`;
}

export default function AdminSiteChat() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [staleFilter, setStaleFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');
  const [activeId, setActiveId] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const payload = await adminApi.listSiteChatThreads({
        status: statusFilter || undefined,
        query: debouncedQuery || undefined,
        stale: staleFilter || undefined,
        sortBy,
        sortDir,
        limit: 400,
      });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);
      setActiveId((prev) => (prev && list.some((row) => row.id === prev) ? prev : (list[0]?.id || '')));
    } catch (err) {
      setRows([]);
      setError(err.message || 'Failed to load site chat inbox');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, debouncedQuery, staleFilter, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      load({ soft: true });
    }, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeId) || null,
    [rows, activeId],
  );

  useEffect(() => {
    setReplyDraft('');
  }, [activeId]);

  const updateStatus = async (nextStatus) => {
    if (!activeRow) return;
    setUpdatingStatus(true);
    setError('');
    setNotice('');
    try {
      const payload = await adminApi.updateSiteChatThreadStatus(activeRow.id, nextStatus);
      const next = payload?.data || null;
      if (next) {
        setRows((prev) => prev.map((row) => (row.id === next.id ? next : row)));
        setActiveId(next.id);
      }
      setNotice(`Thread marked ${nextStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to update chat status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendReply = async () => {
    if (!activeRow || !replyDraft.trim()) return;
    setReplying(true);
    setError('');
    setNotice('');
    try {
      const payload = await adminApi.sendSiteChatReply(activeRow.id, replyDraft.trim());
      const next = payload?.data || null;
      if (next) {
        setRows((prev) => prev.map((row) => (row.id === next.id ? next : row)));
        setActiveId(next.id);
      }
      setReplyDraft('');
      setNotice('Reply sent to the website chat.');
    } catch (err) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>Site Chat</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Floating widget inbox</h1>
          <p className="text-sm font-light mt-2 max-w-2xl" style={{ color: 'var(--fg2)' }}>
            Website chat threads synced from the bottom-right floating chat. Search by name, email, or message text and sort by recency.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load({ soft: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
          style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
        >
          {refreshing ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : <RefreshCw className="w-3 h-3" strokeWidth={2} />}
          Refresh
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-5" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
        <div className="grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3">
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Search</span>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px solid var(--border2)' }}>
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--fg3)' }} strokeWidth={1.8} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent border-0 outline-none text-sm w-full" style={{ color: 'var(--fg)' }} placeholder="Name, email, message text" />
            </div>
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
              <option value="">All</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Staleness</span>
            <select value={staleFilter} onChange={(e) => setStaleFilter(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
              <option value="">All</option>
              <option value="fresh_24h">Under 24h</option>
              <option value="one_to_three_days">1-3 days</option>
              <option value="three_plus_days">3+ days</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
              <option value="updated_at">Last updated</option>
              <option value="last_client_message_at">Last client message</option>
              <option value="last_admin_reply_at">Last admin reply</option>
              <option value="created_at">Created</option>
              <option value="display_name">Client name</option>
              <option value="message_count">Message count</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Direction</span>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </div>

      {(error || notice) && (
        <div className="mb-5 space-y-2">
          {error && (
            <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: 'rgba(224,138,111,0.08)', border: '1px solid rgba(224,138,111,0.3)', color: '#E8A58D' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: 'rgba(67,154,106,0.1)', border: '1px solid rgba(99,230,168,0.26)', color: '#7DE5B1' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{notice}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>Threads ({rows.length})</p>
          {loading ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>No threads found for current filters.</div>
          ) : (
            <div className="space-y-2.5 max-h-[70vh] overflow-auto pr-1">
              {rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setActiveId(row.id)}
                  className="w-full text-left rounded-xl p-3"
                  style={{
                    border: `1px solid ${row.id === activeId ? 'var(--special-border)' : 'var(--border2)'}`,
                    background: row.id === activeId ? 'var(--special-bg)' : 'var(--bg)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm" style={{ color: 'var(--fg)' }}>{row.display_name || 'Website Visitor'}</p>
                    <span className="text-[10px] tracking-[0.14em] uppercase px-2 py-1 rounded-full" style={statusStyle(row.status)}>{row.status}</span>
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--fg2)' }}>{row.email || 'No email provided'}</p>
                  <p className="text-[11px] mt-2 line-clamp-2" style={{ color: 'var(--fg2)' }}>{row.latest_message_preview || 'No messages yet.'}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--fg3)' }}>
                    <span>{row.message_count} messages</span>
                    <span>{staleLabel(row.stale_hours)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          {!activeRow ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Select a thread to read and reply.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Active thread</p>
                  <h3 className="text-2xl mt-1" style={{ color: 'var(--fg)' }}>{activeRow.display_name || 'Website Visitor'}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>{activeRow.email || 'No email provided'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Last updated</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{formatTime(activeRow.updated_at)}</p>
                  <p className="text-xs" style={{ color: 'var(--fg2)' }}>{staleLabel(activeRow.stale_hours)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {['new', 'pending', 'done'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(status)}
                    disabled={updatingStatus}
                    className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase disabled:opacity-55"
                    style={{ border: '1px solid var(--border2)', color: activeRow.status === status ? 'var(--accent-text)' : 'var(--fg2)', background: activeRow.status === status ? 'var(--accent-dim)' : 'transparent' }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl p-3 max-h-[52vh] overflow-auto space-y-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                {activeRow.messages.length ? activeRow.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[88%] rounded-2xl px-4 py-3"
                      style={{
                        background: message.sender === 'admin' ? 'var(--special-bg)' : 'var(--bg-elev)',
                        border: `1px solid ${message.sender === 'admin' ? 'var(--special-border)' : 'var(--border2)'}`,
                      }}
                    >
                      <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: message.sender === 'admin' ? 'var(--special-accent)' : 'var(--fg3)' }}>
                        {message.sender === 'admin' ? 'Admin' : activeRow.display_name || 'Visitor'}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fg)' }}>{message.text}</p>
                      <p className="mt-2 text-[11px]" style={{ color: 'var(--fg3)' }}>{formatTime(message.created_at)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>No messages yet.</div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Reply</p>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-xl px-3 py-3 bg-transparent text-sm outline-none resize-y"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}
                  placeholder="Write a reply for the floating website chat..."
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={replying || !replyDraft.trim()}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
                    style={{ border: '1px solid var(--special-border)', color: 'var(--special-accent)', background: 'var(--special-bg)' }}
                  >
                    {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} /> : <Send className="w-3.5 h-3.5" strokeWidth={1.8} />}
                    Send Reply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

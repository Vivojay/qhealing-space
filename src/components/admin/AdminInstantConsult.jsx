import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import { adminApi } from './api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'inprogress', label: 'Pending' },
  { value: 'done', label: 'Done' },
];

const MAX_IMAGES = 10;

function statusTag(status) {
  const normalized = String(status || 'new').toLowerCase();
  if (normalized === 'done') {
    return {
      label: 'Done',
      style: {
        background: 'rgba(38,132,86,0.16)',
        color: '#63E6A8',
        border: '1px solid rgba(99,230,168,0.35)',
      },
    };
  }
  if (normalized === 'inprogress' || normalized === 'pending') {
    return {
      label: 'Pending',
      style: {
        background: 'rgba(168,126,47,0.16)',
        color: '#F4D08F',
        border: '1px solid rgba(244,208,143,0.35)',
      },
    };
  }
  return {
    label: 'New',
    style: {
      background: 'rgba(75,121,184,0.16)',
      color: '#A6CBF5',
      border: '1px solid rgba(166,203,245,0.35)',
    },
  };
}

function formatTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function AdminInstantConsult() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const [activeReplyId, setActiveReplyId] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [replyingId, setReplyingId] = useState('');
  const [replyNotice, setReplyNotice] = useState('');

  const load = useCallback(async ({ soft = false, quiet = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    if (!quiet) setError('');

    try {
      const payload = await adminApi.listInstantConsult(statusFilter === 'all' ? undefined : statusFilter);
      setRows(payload?.data || []);
    } catch (err) {
      if (!quiet) setError(err.message || 'Failed to load instant consult queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      load({ soft: true, quiet: true });
    }, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.display_name, row.email, row.type_label, row.question, row.payment_reference, row.id, row.admin_reply?.text]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  const activeRow = useMemo(
    () => filteredRows.find((row) => row.id === activeReplyId) || rows.find((row) => row.id === activeReplyId) || null,
    [filteredRows, rows, activeReplyId],
  );

  useEffect(() => {
    if (activeRow) return;
    setActiveReplyId('');
    setReplyDraft('');
    setReplyFiles([]);
  }, [activeRow]);

  const updateStatus = async (id, nextStatus) => {
    setUpdatingId(id);
    setReplyNotice('');
    setError('');
    try {
      const payload = await adminApi.updateInstantConsultStatus(id, nextStatus);
      const next = payload?.data;
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...next } : row)));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId('');
    }
  };

  const openReply = (row) => {
    setActiveReplyId(row.id);
    setReplyDraft(row.admin_reply?.text || '');
    setReplyFiles([]);
    setReplyNotice('');
    setError('');
  };

  const onPickFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const merged = [...replyFiles, ...files].slice(0, MAX_IMAGES);
    setReplyFiles(merged);
    if (merged.length < replyFiles.length + files.length) {
      setReplyNotice(`Only the first ${MAX_IMAGES} images are kept.`);
    }
  };

  const removeReplyFile = (idx) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitReply = async () => {
    if (!activeRow || replyingId) return;
    const text = replyDraft.trim();
    if (!text) {
      setError('Reply text is required.');
      return;
    }
    if (replyFiles.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    setError('');
    setReplyNotice('');
    setReplyingId(activeRow.id);
    try {
      const formData = new FormData();
      formData.append('reply_text', text);
      replyFiles.forEach((file) => formData.append('images', file));

      const payload = await adminApi.sendInstantConsultReply(activeRow.id, formData);
      const next = payload?.data;
      setRows((prev) => prev.map((row) => (row.id === activeRow.id ? { ...row, ...next } : row)));
      setReplyFiles([]);
      setReplyDraft(next?.admin_reply?.text || text);
      setReplyNotice(payload?.email_sent
        ? 'Reply saved, synced to client, and email sent.'
        : 'Reply saved and synced. Email sending failed (check SMTP settings).');
    } catch (err) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setReplyingId('');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center gap-3" style={{ color: 'var(--fg2)' }}>
        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
        Loading instant consult queue...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>◊ Instant Consult</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Reply queue</h1>
          <p className="text-sm font-light mt-2" style={{ color: 'var(--fg2)' }}>
            Live queue with direct admin replies, image attachments, and status sync.
          </p>
        </div>
        <button
          onClick={() => load({ soft: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase hover-accent disabled:opacity-60"
          style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['all', ...STATUS_OPTIONS.map((item) => item.value)].map((status) => {
          const active = statusFilter === status;
          const label = status === 'all'
            ? 'All'
            : STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase"
              style={{
                border: '1px solid var(--border2)',
                color: active ? 'var(--accent-text)' : 'var(--fg2)',
                background: active ? 'var(--accent-dim)' : 'transparent',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl px-3.5 py-2.5 flex items-center gap-2" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
        <Search className="w-3.5 h-3.5" style={{ color: 'var(--fg3)' }} strokeWidth={1.8} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client, type, question, payment ref"
          className="flex-1 bg-transparent border-0 outline-none text-sm"
          style={{ color: 'var(--fg)' }}
        />
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-5 flex items-start gap-2" style={{ background: 'rgba(224,138,111,0.08)', border: '1px solid rgba(224,138,111,0.3)', color: '#E08A6F' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm font-light">{error}</span>
        </div>
      )}

      {replyNotice && (
        <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-soft)', color: 'var(--accent-text)' }}>
          {replyNotice}
        </div>
      )}

      {!filteredRows.length ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
          <MessageCircle className="w-5 h-5 mx-auto mb-3" style={{ color: 'var(--fg3)' }} strokeWidth={1.8} />
          <p className="text-sm" style={{ color: 'var(--fg2)' }}>No messages found for current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRows.map((row) => {
            const tag = statusTag(row.status);
            const isReplyOpen = activeReplyId === row.id;
            const savedReply = row.admin_reply;
            return (
              <div key={row.id} className="rounded-xl p-4 lg:p-5" style={{ border: '1px solid var(--border)', background: 'var(--bg-elev)' }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--fg3)' }}>{formatTime(row.created_at)}</p>
                    <h3 className="text-lg mt-1" style={{ color: 'var(--fg)' }}>
                      {row.display_name || row.email || 'Client'}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--fg2)' }}>{row.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={tag.style}>
                      {tag.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => openReply(row)}
                      className="px-3 py-1.5 rounded text-[10px] tracking-[0.18em] uppercase"
                      style={{ border: '1px solid var(--border2)', color: 'var(--accent-text)' }}
                    >
                      {savedReply?.text ? 'Edit Reply' : 'Reply'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid lg:grid-cols-[1.2fr_1fr] gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>
                      {row.type_label || row.type_id}
                    </p>
                    <p className="mt-2 text-sm font-light leading-relaxed" style={{ color: 'var(--fg)' }}>{row.question}</p>

                    {savedReply?.text && (
                      <div className="mt-4 p-3 rounded-lg" style={{ border: '1px solid var(--accent-soft)', background: 'var(--accent-dim)' }}>
                        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--accent-text)' }}>Latest reply</p>
                        <p className="mt-2 text-sm font-light leading-relaxed" style={{ color: 'var(--fg)' }}>{savedReply.text}</p>
                        <p className="mt-2 text-[11px]" style={{ color: 'var(--fg2)' }}>
                          {formatTime(savedReply.replied_at)} · mail: {savedReply.email_status || 'pending'}
                        </p>
                        {!!savedReply.images?.length && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {savedReply.images.map((img, idx) => (
                              img.url ? (
                                <a
                                  key={`${row.id}-saved-${idx}`}
                                  href={img.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block rounded overflow-hidden"
                                  style={{ border: '1px solid var(--border2)' }}
                                >
                                  <img src={img.url} alt={img.name || `reply-${idx + 1}`} className="w-full h-24 object-cover" />
                                </a>
                              ) : (
                                <div
                                  key={`${row.id}-saved-${idx}`}
                                  className="rounded p-2 text-[10px] break-all"
                                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                                >
                                  {img.path || img.name || `image-${idx + 1}`}
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg px-3 py-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Payment</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--fg)' }}>
                      INR {row.payment_amount} · {row.payment_reference}
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--fg2)' }}>ID: {row.id}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((next) => (
                        <button
                          key={`${row.id}-${next.value}`}
                          onClick={() => updateStatus(row.id, next.value)}
                          disabled={updatingId === row.id || row.status === next.value}
                          className="px-2.5 py-1 rounded text-[10px] tracking-[0.18em] uppercase disabled:opacity-45"
                          style={{ border: '1px solid var(--border2)', color: row.status === next.value ? 'var(--accent-text)' : 'var(--fg2)' }}
                        >
                          {next.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isReplyOpen && (
                  <div className="mt-4 p-4 rounded-xl" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--accent-text)' }}>
                      Send client reply
                    </p>
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={4}
                      placeholder="Write a complete response for the client..."
                      className="w-full mt-2 bg-transparent border-0 outline-none resize-none text-sm leading-relaxed"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)', paddingBottom: '10px' }}
                    />

                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <label
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase cursor-pointer"
                        style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                      >
                        <ImagePlus className="w-3.5 h-3.5" strokeWidth={1.8} />
                        Add images ({replyFiles.length}/{MAX_IMAGES})
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={onPickFiles}
                        />
                      </label>
                      {!!replyFiles.length && (
                        <div className="flex flex-wrap gap-2">
                          {replyFiles.map((file, idx) => (
                            <button
                              key={`${file.name}-${idx}`}
                              type="button"
                              onClick={() => removeReplyFile(idx)}
                              className="px-2.5 py-1 rounded text-[10px]"
                              style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                            >
                              {file.name.length > 18 ? `${file.name.slice(0, 18)}...` : file.name} ×
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={submitReply}
                        disabled={replyingId === row.id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        {replyingId === row.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Send className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

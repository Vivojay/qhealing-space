import React, { useEffect, useMemo, useState } from 'react';
import { Download, Trash2, Search, RefreshCw, Loader2, AlertCircle, Mail } from 'lucide-react';
import { adminApi, getToken } from './api';

function fmtDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString();
  } catch {
    return String(s);
  }
}

export default function AdminNewsletter() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await adminApi.listSubscribers();
      setRows(r.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.email || '').toLowerCase().includes(q) ||
      (r.source || '').toLowerCase().includes(q)
    );
  }, [rows, query]);

  const exportCsv = async () => {
    try {
      // Use a fetch with auth header, then trigger download
      const token = getToken();
      const res = await fetch('/api/admin/newsletter/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Export failed');
    }
  };

  const confirmDelete = (email) => setConfirming(email);
  const doDelete = async () => {
    if (!confirming) return;
    setDeleting(true);
    try {
      await adminApi.deleteSubscriber(confirming);
      setRows((prev) => prev.filter((r) => r.email !== confirming));
      setConfirming(null);
    } catch (e) {
      setError(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>◊ Newsletter</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Subscribers</h1>
          <p className="text-sm font-light mt-2" style={{ color: 'var(--fg2)' }}>
            {rows.length} {rows.length === 1 ? 'person' : 'people'} subscribed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase hover-accent" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
            <RefreshCw className="w-3 h-3" strokeWidth={1.8} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase disabled:opacity-50" style={{ background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }}>
            <Download className="w-3 h-3" strokeWidth={1.8} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 flex items-start gap-2" style={{ background: 'rgba(224,138,111,0.08)', border: '1px solid rgba(224,138,111,0.3)', color: '#E08A6F' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm font-light">{error}</span>
        </div>
      )}

      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-full mb-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}
      >
        <Search className="w-3.5 h-3.5" style={{ color: 'var(--fg3)' }} strokeWidth={1.8} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or source"
          className="flex-1 bg-transparent border-0 outline-none text-sm font-light placeholder:opacity-40"
          style={{ color: 'var(--fg)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-[10px] tracking-[0.22em] uppercase opacity-60 hover:opacity-100" style={{ color: 'var(--fg2)' }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg2)', border: '1px dashed var(--border2)', color: 'var(--fg2)' }}>
          <Mail className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--fg3)' }} strokeWidth={1.4} />
          <p className="text-sm font-light">{query ? 'No subscribers match your search.' : 'No subscribers yet.'}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left font-light px-5 py-3">Email</th>
                <th className="text-left font-light px-5 py-3 hidden md:table-cell">Source</th>
                <th className="text-left font-light px-5 py-3 hidden md:table-cell">Subscribed</th>
                <th className="text-right font-light px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-light" style={{ color: 'var(--fg)' }}>{row.email}</td>
                  <td className="px-5 py-3 font-light hidden md:table-cell" style={{ color: 'var(--fg2)' }}>{row.source || '—'}</td>
                  <td className="px-5 py-3 font-light hidden md:table-cell text-xs" style={{ color: 'var(--fg2)' }}>{fmtDate(row.subscribed_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => confirmDelete(row.email)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.22em] uppercase hover-accent"
                      style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.8} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70" onClick={() => !deleting && setConfirming(null)}>
          <div className="max-w-sm w-full rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-light mb-2" style={{ color: 'var(--fg)' }}>Remove subscriber?</h3>
            <p className="text-sm font-light mb-5" style={{ color: 'var(--fg2)' }}>
              <span style={{ color: 'var(--accent-text)' }}>{confirming}</span> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirming(null)} disabled={deleting} className="px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
                Cancel
              </button>
              <button onClick={doDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase" style={{ background: '#9C4A3F', color: '#fff', border: '1px solid #9C4A3F' }}>
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : <Trash2 className="w-3 h-3" strokeWidth={2} />}
                {deleting ? 'Removing' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

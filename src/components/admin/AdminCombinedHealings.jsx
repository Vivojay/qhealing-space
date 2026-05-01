import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Shuffle,
} from 'lucide-react';
import { adminApi } from './api';

function chipStyle(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'approved' || normalized === 'approved_all' || normalized === 'checkout_paid') {
    return {
      background: 'rgba(67,154,106,0.16)',
      border: '1px solid rgba(99,230,168,0.35)',
      color: '#7DE5B1',
    };
  }
  if (normalized === 'needs_correction') {
    return {
      background: 'rgba(224,138,111,0.14)',
      border: '1px solid rgba(224,138,111,0.36)',
      color: '#F2B199',
    };
  }
  if (normalized === 'corrected') {
    return {
      background: 'rgba(140,111,214,0.17)',
      border: '1px solid rgba(173,145,255,0.4)',
      color: '#CFBDFF',
    };
  }
  if (normalized === 'in_review' || normalized === 'checkout_pending' || normalized === 'awaiting_payment') {
    return {
      background: 'rgba(171,130,51,0.16)',
      border: '1px solid rgba(245,208,125,0.36)',
      color: '#F5D07D',
    };
  }
  return {
    background: 'rgba(95,124,165,0.16)',
    border: '1px solid rgba(160,191,233,0.34)',
    color: '#A6CBF5',
  };
}

export default function AdminCombinedHealings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [checkoutFilter, setCheckoutFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');

  const [activeUid, setActiveUid] = useState('');
  const [selectedWishIds, setSelectedWishIds] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async ({ keepSelection = true } = {}) => {
    setLoading(true);
    setError('');
    try {
      const payload = await adminApi.listCombinedHealingsRequests({
        status: statusFilter || undefined,
        checkoutStatus: checkoutFilter || undefined,
        countryProfile: countryFilter || undefined,
        query: debouncedQuery || undefined,
        sortBy,
        sortDir,
        limit: 400,
      });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);

      setActiveUid((prev) => {
        if (prev && list.some((item) => item.uid === prev)) return prev;
        return list[0]?.uid || '';
      });

      if (!keepSelection) {
        setSelectedWishIds([]);
      }
    } catch (e) {
      setRows([]);
      setError(e.message || 'Failed to load combined-healings requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, checkoutFilter, countryFilter, debouncedQuery, sortBy, sortDir]);

  useEffect(() => {
    load({ keepSelection: false });
  }, [load]);

  useEffect(() => {
    if (loading) return undefined;
    if (document.hidden) return undefined;
    const timer = setInterval(() => {
      load({ keepSelection: true });
    }, 12000);
    return () => clearInterval(timer);
  }, [loading, load]);

  const active = useMemo(
    () => rows.find((item) => item.uid === activeUid) || null,
    [rows, activeUid],
  );

  const wishIds = useMemo(
    () => (Array.isArray(active?.wishes) ? active.wishes.map((wish) => wish.id).filter(Boolean) : []),
    [active],
  );
  const reviewLocked = String(active?.checkout_status || '').toLowerCase() === 'paid';

  useEffect(() => {
    setSelectedWishIds((prev) => prev.filter((id) => wishIds.includes(id)));
  }, [wishIds]);

  const updateRow = (nextRow) => {
    if (!nextRow?.uid) return;
    setRows((prev) => prev.map((item) => (item.uid === nextRow.uid ? nextRow : item)));
    setActiveUid(nextRow.uid);
  };

  const toggleWish = (wishId) => {
    setSelectedWishIds((prev) => (
      prev.includes(wishId)
        ? prev.filter((id) => id !== wishId)
        : [...prev, wishId]
    ));
  };

  const selectAll = () => setSelectedWishIds(wishIds);
  const clearSelection = () => setSelectedWishIds([]);
  const invertSelection = () => {
    setSelectedWishIds((prev) => wishIds.filter((wishId) => !prev.includes(wishId)));
  };

  const applyDecision = async (decision) => {
    if (!active?.uid) return;
    if (reviewLocked) {
      setError('Checkout is already paid. Review actions are locked for this request.');
      return;
    }
    if (!selectedWishIds.length) {
      setError('Select at least one wish before applying decision.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload = await adminApi.reviewCombinedHealingRequest(active.uid, {
        decision,
        selected_wish_ids: selectedWishIds,
        note,
      });
      updateRow(payload?.data);
      setNotice(decision === 'approved' ? 'Selected wishes marked as approved.' : 'Selected wishes marked as needs correction.');
    } catch (e) {
      setError(e.message || 'Failed to apply review decision');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async () => {
    if (!active?.uid) return;
    if (reviewLocked) {
      setError('Checkout is already paid. Review actions are locked for this request.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload = await adminApi.submitCombinedHealingReview(active.uid, note);
      updateRow(payload?.data);
      setNotice('Review submitted to client.');
    } catch (e) {
      setError(e.message || 'Failed to submit review update');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>Combined Healings</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Request review desk</h1>
          <p className="text-sm font-light mt-2 max-w-2xl" style={{ color: 'var(--fg2)' }}>
            Review latest request state only. No historical rounds are shown.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load({ keepSelection: true })}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
          style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : <RefreshCw className="w-3 h-3" strokeWidth={2} />}
          Refresh
        </button>
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

      <div className="grid xl:grid-cols-[0.82fr_1.08fr_0.56fr] gap-5">
        <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>Requests ({rows.length})</p>
          {loading ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>No requests found for current filters.</div>
          ) : (
            <div className="space-y-2.5 max-h-[70vh] overflow-auto pr-1">
              {rows.map((row) => {
                const activeCard = row.uid === activeUid;
                return (
                  <button
                    key={row.uid}
                    type="button"
                    onClick={() => setActiveUid(row.uid)}
                    className="w-full text-left rounded-xl p-3"
                    style={{
                      border: `1px solid ${activeCard ? 'var(--special-border)' : 'var(--border2)'}`,
                      background: activeCard ? 'var(--special-bg)' : 'var(--bg)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm" style={{ color: 'var(--fg)' }}>{row.display_name || row.email || row.uid}</p>
                      <span className="text-[10px] tracking-[0.14em] uppercase px-2 py-1 rounded-full" style={chipStyle(row.status)}>{row.status}</span>
                    </div>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--fg2)' }}>{row.email}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-1 rounded-full" style={chipStyle(row.checkout_status)}>
                        checkout: {row.checkout_status}
                      </span>
                      <span className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>
                        wishes {row.wish_count} | reviews {row.review_count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          {!active ? (
            <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Select a request to review wishes.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Active request</p>
                  <h3 className="text-2xl mt-1" style={{ color: 'var(--fg)' }}>{active.display_name || active.email || active.uid}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>{active.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Ritual event</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{active.ritual_event_label || active.ritual_event_id || 'Not set'}</p>
                  <p className="text-xs" style={{ color: 'var(--fg2)' }}>{active.ritual_event_date || 'No date selected'}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {reviewLocked && (
                  <span className="text-[10px] tracking-[0.16em] uppercase px-2 py-1 rounded-full" style={{ background: 'rgba(67,154,106,0.2)', border: '1px solid rgba(99,230,168,0.35)', color: '#7DE5B1' }}>
                    Checkout paid - review locked
                  </span>
                )}
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={reviewLocked}
                  className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.16em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={invertSelection}
                  disabled={reviewLocked}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-[0.16em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                >
                  <Shuffle className="w-3 h-3" strokeWidth={2} />
                  Invert
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={reviewLocked}
                  className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.16em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                >
                  Clear
                </button>
                <span className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>
                  selected {selectedWishIds.length} / {wishIds.length}
                </span>
              </div>

              <div className="mt-3 space-y-2 max-h-[44vh] overflow-auto pr-1">
                {(active.wishes || []).map((wish, index) => {
                  const picked = selectedWishIds.includes(wish.id);
                  return (
                    <label key={wish.id} className="flex gap-3 rounded-xl p-3" style={{ border: '1px solid var(--border2)', background: picked ? 'var(--special-bg)' : 'var(--bg)' }}>
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => toggleWish(wish.id)}
                        disabled={reviewLocked}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-[11px] tracking-[0.15em] uppercase" style={{ color: 'var(--fg3)' }}>Wish {index + 1}</p>
                          <span className="text-[10px] tracking-[0.12em] uppercase px-2 py-1 rounded-full" style={chipStyle(wish.status)}>{wish.status}</span>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--fg)' }}>{wish.text}</p>
                        {wish.admin_note ? (
                          <p className="text-xs mt-1" style={{ color: '#F2B199' }}>Note: {wish.admin_note}</p>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>

              <label className="block mt-4">
                <span className="block text-[10px] tracking-[0.18em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Correction note (used for needs correction)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={reviewLocked}
                  className="w-full rounded-xl p-3 bg-transparent border-0 outline-none resize-y text-sm"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}
                  placeholder="Write clear correction feedback for selected wishes..."
                />
              </label>

              <div className="mt-4 grid sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={busy || reviewLocked}
                  onClick={() => applyDecision('approved')}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
                  style={{ background: 'rgba(67,154,106,0.22)', color: '#7DE5B1', border: '1px solid rgba(99,230,168,0.4)' }}
                >
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : null}
                  Mark approved
                </button>
                <button
                  type="button"
                  disabled={busy || reviewLocked}
                  onClick={() => applyDecision('needs_correction')}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
                  style={{ background: 'rgba(224,138,111,0.16)', color: '#F2B199', border: '1px solid rgba(224,138,111,0.45)' }}
                >
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : null}
                  Needs correction
                </button>
                <button
                  type="button"
                  disabled={busy || reviewLocked}
                  onClick={submitReview}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
                  style={{ border: '1px solid var(--special-border)', color: 'var(--special-accent)', background: 'var(--special-bg)' }}
                >
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : <Send className="w-3 h-3" strokeWidth={2} />}
                  Submit review
                </button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl p-4 h-fit xl:sticky xl:top-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}>
          <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>Filters</p>
          <div className="space-y-3">
            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Search</span>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px solid var(--border2)' }}>
                <Search className="w-3.5 h-3.5" style={{ color: 'var(--fg3)' }} strokeWidth={1.8} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent border-0 outline-none text-sm w-full" style={{ color: 'var(--fg)' }} placeholder="Name, email, wish..." />
              </div>
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Status</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="in_review">In review</option>
                <option value="needs_correction">Needs correction</option>
                <option value="approved_all">Approved all</option>
                <option value="checkout_pending">Checkout pending</option>
                <option value="checkout_paid">Checkout paid</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Checkout</span>
              <select value={checkoutFilter} onChange={(e) => setCheckoutFilter(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
                <option value="">All</option>
                <option value="not_started">Not started</option>
                <option value="awaiting_payment">Awaiting payment</option>
                <option value="paid">Paid</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Country</span>
              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
                <option value="">All</option>
                <option value="india">India</option>
                <option value="outside_india">Outside India</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'var(--fg3)' }}>Sort by</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-transparent text-sm" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
                <option value="updated_at">Last updated</option>
                <option value="review_count">Review count</option>
                <option value="wish_count">Wish count</option>
                <option value="checkout_status">Checkout status</option>
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
      </div>
    </div>
  );
}

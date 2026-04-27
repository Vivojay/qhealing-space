import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { getIdToken, onAuthStateChanged, signOut } from 'firebase/auth';
import Footer from '@/components/wellness/Footer';
import { apiUrl, createPageUrl } from '@/utils';
import { firebaseAuth, firebaseConfigured } from '@/lib/firebaseClient';
import { PRICING } from '@/constants/pricing';

const OUTSIDE_NOTICE = 'International checkout is currently visible but disabled. Use India-side rails (Wise/Remitly/Western Union) and contact support for confirmation.';
const MAX_WISH_LEN = 200;
const DEFAULT_OUTSIDE_RAILS = [
  { id: 'wise', name: 'Wise', detail: 'Best for direct bank transfer into India.' },
  { id: 'remitly', name: 'Remitly', detail: 'Fast INR settlement to India account rails.' },
  { id: 'western-union', name: 'Western Union', detail: 'Global transfer rails with India payout support.' },
];

function isUnverifiedPasswordUser(user) {
  if (!user) return false;
  const providers = Array.isArray(user.providerData) ? user.providerData : [];
  const usesPasswordSignIn = providers.some((item) => item?.providerId === 'password');
  return usesPasswordSignIn && !user.emailVerified;
}

async function parseApiError(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    return `HTTP ${res.status}`;
  }
  if (body && typeof body.detail === 'string') return body.detail;
  if (body && Array.isArray(body.detail)) return body.detail[0]?.msg || `HTTP ${res.status}`;
  return `HTTP ${res.status}`;
}

function statusToken(status) {
  const normalized = String(status || 'draft').toLowerCase();
  if (normalized === 'approved') {
    return {
      label: 'Approved',
      style: {
        background: 'rgba(38,132,86,0.16)',
        color: '#63E6A8',
        border: '1px solid rgba(99,230,168,0.35)',
      },
    };
  }
  if (normalized === 'needs_correction') {
    return {
      label: 'Needs correction',
      style: {
        background: 'rgba(224,138,111,0.15)',
        color: '#E8A58D',
        border: '1px solid rgba(232,165,141,0.34)',
      },
    };
  }
  if (normalized === 'corrected') {
    return {
      label: 'Corrected',
      style: {
        background: 'rgba(148,111,224,0.16)',
        color: '#C7B3FF',
        border: '1px solid rgba(199,179,255,0.36)',
      },
    };
  }
  if (normalized === 'in_review') {
    return {
      label: 'In review',
      style: {
        background: 'rgba(168,126,47,0.16)',
        color: '#F4D08F',
        border: '1px solid rgba(244,208,143,0.35)',
      },
    };
  }
  return {
    label: 'Draft',
    style: {
      background: 'rgba(75,121,184,0.14)',
      color: '#A6CBF5',
      border: '1px solid rgba(166,203,245,0.3)',
    },
  };
}

function formatTotal(amount, countryProfile) {
  if (countryProfile === 'outside_india') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function nextLocalWishId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function CombinedHealings() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  const [geoLoading, setGeoLoading] = useState(true);
  const [countryCode, setCountryCode] = useState('IN');
  const [countryProfile, setCountryProfile] = useState('india');

  const [authUser, setAuthUser] = useState(null);
  const [idToken, setIdToken] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false);

  const [requestRow, setRequestRow] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [wishes, setWishes] = useState([{ id: nextLocalWishId(), text: '', status: 'draft', admin_note: '' }]);

  const [wishFilter, setWishFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [checkoutStarting, setCheckoutStarting] = useState(false);
  const [checkoutRefreshing, setCheckoutRefreshing] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState('');
  const [checkoutSessionStatus, setCheckoutSessionStatus] = useState('');
  const [checkoutQrSrc, setCheckoutQrSrc] = useState('');
  const [checkoutUpiIntent, setCheckoutUpiIntent] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [checkoutRails, setCheckoutRails] = useState(DEFAULT_OUTSIDE_RAILS);

  const paymentCardRef = useRef(null);

  const emailVerificationPending = useMemo(() => isUnverifiedPasswordUser(authUser), [authUser]);

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const wishCount = wishes.length;
  const wishUnitPrice = countryProfile === 'outside_india'
    ? PRICING.combinedHealings.international.amount
    : PRICING.combinedHealings.india.amount;
  const wishUnitLabel = countryProfile === 'outside_india'
    ? PRICING.combinedHealings.international.label
    : PRICING.combinedHealings.india.label;
  const checkoutTotal = wishUnitPrice * wishCount;
  const checkoutTotalLabel = formatTotal(checkoutTotal, countryProfile);

  const allApproved = useMemo(
    () => wishCount > 0 && wishes.every((wish) => String(wish.status || '').toLowerCase() === 'approved'),
    [wishCount, wishes],
  );

  const canSubmitReview = useMemo(() => {
    if (!authUser || emailVerificationPending) return false;
    if (!selectedEvent) return false;
    if (!wishes.length) return false;
    if (allApproved) return false;
    return wishes.every((wish) => wish.text.trim().length > 0 && wish.text.trim().length <= MAX_WISH_LEN);
  }, [authUser, emailVerificationPending, selectedEvent, wishes, allApproved]);

  const canCheckout = useMemo(() => {
    if (!authUser || emailVerificationPending) return false;
    if (!selectedEvent) return false;
    if (!allApproved) return false;
    if (countryProfile === 'outside_india') return false;
    return true;
  }, [authUser, emailVerificationPending, selectedEvent, allApproved, countryProfile]);

  const displayedWishes = useMemo(() => {
    if (wishFilter === 'all') return wishes;
    return wishes.filter((wish) => String(wish.status || '').toLowerCase() === wishFilter);
  }, [wishFilter, wishes]);

  const resetCheckoutState = () => {
    setCheckoutSessionId('');
    setCheckoutSessionStatus('');
    setCheckoutQrSrc('');
    setCheckoutUpiIntent('');
    setCheckoutNotice('');
  };

  const nudgeAuth = useCallback((mode = 'signup') => {
    const nextPath = createPageUrl('Combined Healings');
    const normalized = mode === 'login' ? 'login' : 'signup';
    navigate(`/auth?mode=${normalized}&next=${encodeURIComponent(nextPath)}`);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setEventsLoading(true);
    setEventsError('');
    fetch(apiUrl('/api/combined-healings/events?limit=10'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        setEvents(rows);
        setSelectedEventId((prev) => prev || rows[0]?.id || '');
      })
      .catch((err) => {
        if (cancelled) return;
        setEvents([]);
        setEventsError(err.message || 'Unable to load ritual events right now.');
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/geo/country'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const profile = String(payload?.country_profile || '').trim().toLowerCase();
        setCountryProfile(profile === 'outside_india' ? 'outside_india' : 'india');
        setCountryCode(String(payload?.country_code || 'IN').trim().toUpperCase() || 'IN');
      })
      .catch(() => {
        if (!cancelled) {
          setCountryProfile('india');
          setCountryCode('IN');
        }
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthUser(null);
      setIdToken('');
      return undefined;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setAuthUser(user || null);
      if (user && !isUnverifiedPasswordUser(user)) {
        const token = await getIdToken(user, true);
        setIdToken(token);
      } else {
        setIdToken('');
      }
    });
    return () => unsub();
  }, []);

  const loadMyRequest = useCallback(async (tokenOverride) => {
    const token = tokenOverride || idToken;
    if (!token) return;
    setLoadingRequest(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/combined-healings/my-request'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const row = payload?.data || null;
      setRequestRow(row);
      if (row?.country_profile) {
        setCountryProfile(row.country_profile === 'outside_india' ? 'outside_india' : 'india');
      }
      if (row?.country_code) {
        setCountryCode(String(row.country_code).trim().toUpperCase());
      }
      if (row?.ritual_event_id) {
        setSelectedEventId(row.ritual_event_id);
      }
      const serverWishes = Array.isArray(row?.wishes) ? row.wishes : [];
      if (serverWishes.length) {
        setWishes(serverWishes.map((wish) => ({
          id: String(wish.id),
          text: String(wish.text || ''),
          status: String(wish.status || 'draft'),
          admin_note: String(wish.admin_note || ''),
        })));
      } else {
        setWishes([{ id: nextLocalWishId(), text: '', status: 'draft', admin_note: '' }]);
      }
      if (row?.checkout_session_id) {
        setCheckoutSessionId(String(row.checkout_session_id));
      }
      if (row?.checkout_status === 'paid') {
        setCheckoutSessionStatus('paid');
        setCheckoutNotice('Checkout is already paid and confirmed.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load your combined-healings request.');
    } finally {
      setLoadingRequest(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (!idToken || emailVerificationPending) return;
    loadMyRequest(idToken);
  }, [idToken, emailVerificationPending, loadMyRequest]);

  const onSignOut = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth).catch(() => {});
    setAuthUser(null);
    setIdToken('');
    setRequestRow(null);
    setWishes([{ id: nextLocalWishId(), text: '', status: 'draft', admin_note: '' }]);
    resetCheckoutState();
  };

  const setWishText = (wishId, nextText) => {
    const value = String(nextText || '').slice(0, MAX_WISH_LEN);
    setWishes((prev) => prev.map((wish) => (
      wish.id === wishId
        ? {
          ...wish,
          text: value,
          status: wish.status === 'needs_correction' ? 'corrected' : wish.status,
        }
        : wish
    )));
  };

  const addWish = () => {
    setWishes((prev) => [...prev, { id: nextLocalWishId(), text: '', status: 'draft', admin_note: '' }]);
  };

  const removeWish = (wishId) => {
    setWishes((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((wish) => wish.id !== wishId);
    });
  };

  const persistRequest = useCallback(async ({ silent = false } = {}) => {
    if (!idToken) throw new Error('Please sign in first.');
    const hasEmpty = wishes.some((wish) => !wish.text.trim());
    if (hasEmpty) throw new Error('Every wish must contain text before saving.');
    if (!selectedEvent) throw new Error('Select one ritual date from the events list first.');

    if (!silent) {
      setSaving(true);
      setError('');
      setNotice('');
    }

    const payload = {
      ritual_event_id: selectedEvent.id,
      ritual_event_date: selectedEvent.date,
      ritual_event_label: selectedEvent.label,
      ritual_hindu_lunar_label: selectedEvent?.hindu_lunar?.label || '',
      country_profile: countryProfile,
      country_code: countryCode,
      wishes: wishes.map((wish) => ({
        id: String(wish.id || '').startsWith('local_') ? undefined : wish.id,
        text: wish.text.trim(),
      })),
    };

    const res = await fetch(apiUrl('/api/combined-healings/my-request'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    const body = await res.json();
    const row = body?.data || null;
    setRequestRow(row);
    const rows = Array.isArray(row?.wishes) ? row.wishes : [];
    if (rows.length) {
      setWishes(rows.map((wish) => ({
        id: String(wish.id),
        text: String(wish.text || ''),
        status: String(wish.status || 'draft'),
        admin_note: String(wish.admin_note || ''),
      })));
    }
    if (!silent) setNotice('Draft saved.');
    return row;
  }, [idToken, selectedEvent, countryProfile, countryCode, wishes]);

  const saveNow = async () => {
    try {
      await persistRequest({ silent: false });
    } catch (err) {
      setError(err.message || 'Unable to save right now.');
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async () => {
    if (!canSubmitReview) return;
    setReviewing(true);
    setError('');
    setNotice('');
    try {
      const row = await persistRequest({ silent: true });
      const ritual = selectedEvent || {
        id: row?.ritual_event_id,
        date: row?.ritual_event_date,
        label: row?.ritual_event_label,
        hindu_lunar: { label: row?.ritual_hindu_lunar_label || '' },
      };
      const res = await fetch(apiUrl('/api/combined-healings/my-request/review'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ritual_event_id: ritual?.id,
          ritual_event_date: ritual?.date,
          ritual_event_label: ritual?.label,
          ritual_hindu_lunar_label: ritual?.hindu_lunar?.label || '',
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const next = payload?.data || null;
      setRequestRow(next);
      const rows = Array.isArray(next?.wishes) ? next.wishes : [];
      setWishes(rows.map((wish) => ({
        id: String(wish.id),
        text: String(wish.text || ''),
        status: String(wish.status || 'draft'),
        admin_note: String(wish.admin_note || ''),
      })));
      setNotice(payload?.client_notice || 'Review sent to admin.');
      resetCheckoutState();
    } catch (err) {
      setError(err.message || 'Unable to submit review right now.');
    } finally {
      setReviewing(false);
    }
  };

  const cancelRequest = async () => {
    if (!idToken || cancelling) return;
    const confirmed = window.confirm('This will permanently delete your current Combined Healings request. Continue?');
    if (!confirmed) return;
    setCancelling(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(apiUrl('/api/combined-healings/my-request/cancel'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      setRequestRow(null);
      setWishes([{ id: nextLocalWishId(), text: '', status: 'draft', admin_note: '' }]);
      resetCheckoutState();
      setNotice('Your combined-healings request was cancelled and deleted.');
    } catch (err) {
      setError(err.message || 'Unable to cancel request right now.');
    } finally {
      setCancelling(false);
    }
  };

  const refreshCheckoutSession = useCallback(async (sessionId, { quiet = false } = {}) => {
    if (!idToken || !sessionId) return;
    if (!quiet) setCheckoutRefreshing(true);
    try {
      const res = await fetch(apiUrl(`/api/combined-healings/my-request/checkout/session/${encodeURIComponent(sessionId)}`), {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const session = payload?.data || {};
      const status = String(session.status || 'awaiting_payment');
      setCheckoutSessionStatus(status);
      if (session.qr_src) setCheckoutQrSrc(apiUrl(session.qr_src));
      if (session.upi_intent) setCheckoutUpiIntent(session.upi_intent);
      if (status === 'paid') {
        setCheckoutNotice('Checkout payment confirmed.');
        await loadMyRequest(idToken);
      }
    } catch (err) {
      if (!quiet) setCheckoutNotice(err.message || 'Unable to refresh checkout status.');
    } finally {
      if (!quiet) setCheckoutRefreshing(false);
    }
  }, [idToken, loadMyRequest]);

  useEffect(() => {
    if (!checkoutSessionId || !idToken) return undefined;
    if (checkoutSessionStatus === 'paid') return undefined;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      refreshCheckoutSession(checkoutSessionId, { quiet: true });
    }, 5000);
    return () => clearInterval(timer);
  }, [checkoutSessionId, checkoutSessionStatus, idToken, refreshCheckoutSession]);

  const startCheckout = async () => {
    if (!idToken || checkoutStarting) return;
    if (!canCheckout) return;
    setCheckoutStarting(true);
    setError('');
    setNotice('');
    setCheckoutNotice('');
    try {
      await persistRequest({ silent: true });
      const res = await fetch(apiUrl('/api/combined-healings/my-request/checkout/session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ country_profile: countryProfile, country_code: countryCode }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      const session = payload?.data || {};
      setCheckoutSessionId(String(session.id || ''));
      setCheckoutSessionStatus(String(session.status || 'awaiting_payment'));
      setCheckoutQrSrc(session?.qr_src ? apiUrl(session.qr_src) : '');
      setCheckoutUpiIntent(String(session?.upi_intent || ''));
      setCheckoutRails(Array.isArray(payload?.international_rails) ? payload.international_rails : []);
      setCheckoutNotice(payload?.client_notice || 'Checkout session started.');
      await loadMyRequest(idToken);
    } catch (err) {
      setCheckoutNotice(err.message || 'Unable to start checkout right now.');
    } finally {
      setCheckoutStarting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)' }}>
      <section className="relative overflow-hidden py-16 lg:py-20" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 82% 20%, rgba(107,160,204,0.14), transparent 52%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <p className="text-[10px] tracking-[0.42em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
            Combined Healings
          </p>
          <h1 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
            One ritual date,
            <span style={{ color: 'var(--accent-text)', marginLeft: '0.35ch' }}>many wishes.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-sm lg:text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            Build your wish list, choose an upcoming sacred date, and move through review cycles until every wish is approved for checkout.
          </p>
          {!authUser && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => nudgeAuth('signup')}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase"
                style={{ background: 'var(--special-accent)', color: '#fff' }}
              >
                Sign up to unlock
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.9} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="pt-6 pb-20 lg:pt-8 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6 lg:space-y-7">
          <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Events</p>
                <h3 className="text-xl mt-2" style={{ color: 'var(--fg)' }}>Next 10 ritual dates</h3>
                <p className="mt-2 text-xs" style={{ color: 'var(--fg2)' }}>Includes Hindu lunar date for each event.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
                <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="text-[10px] tracking-[0.2em] uppercase">Asia/Kolkata</span>
              </div>
            </div>

            {eventsLoading ? (
              <div className="mt-5 inline-flex items-center gap-2" style={{ color: 'var(--fg2)' }}>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
                Loading events...
              </div>
            ) : eventsError ? (
              <p className="mt-5 text-sm" style={{ color: '#E08A6F' }}>{eventsError}</p>
            ) : (
              <div className="mt-5 space-y-2.5">
                {events.map((event) => {
                  const active = selectedEventId === event.id;
                  return (
                    <button
                      key={`${event.id}-${event.date}`}
                      type="button"
                      onClick={() => setSelectedEventId(event.id)}
                      className="w-full text-left rounded-xl px-4 py-3 transition-all"
                      style={{
                        border: `1px solid ${active ? 'var(--special-border)' : 'var(--border2)'}`,
                        background: active ? 'var(--special-bg)' : 'var(--bg)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm" style={{ color: active ? 'var(--special-accent)' : 'var(--fg)' }}>{event.label}</p>
                        <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--fg3)' }}>{event.date}</p>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>{event?.hindu_lunar?.label || 'Lunar date unavailable'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!firebaseConfigured ? (
            <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid rgba(224,106,106,0.4)', background: 'rgba(224,106,106,0.08)' }}>
              <p className="text-sm" style={{ color: 'var(--fg)' }}>Auth is not configured yet for Combined Healings.</p>
              <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>Set Firebase frontend env vars first.</p>
            </div>
          ) : !authUser ? (
            <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Locked Interface</p>
              <h3 className="text-2xl mt-2" style={{ color: 'var(--fg)' }}>Sign up or login to unlock wish planner</h3>
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => nudgeAuth('signup')}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => nudgeAuth('login')}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                >
                  Login
                </button>
              </div>
            </div>
          ) : emailVerificationPending ? (
            <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
              <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Email verification required</p>
              <h3 className="text-xl mt-2" style={{ color: 'var(--fg)' }}>Verify {authUser?.email || 'your email'} first</h3>
              <button
                type="button"
                onClick={() => nudgeAuth('login')}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase"
                style={{ border: '1px solid var(--special-border)', color: 'var(--special-accent)', background: 'var(--bg)' }}
              >
                Go to login
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Wish Planner</p>
                    <h3 className="text-xl mt-2" style={{ color: 'var(--fg)' }}>{authUser.displayName || authUser.email}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>Min 1 wish. Each wish max {MAX_WISH_LEN} chars.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1.5 rounded"
                    style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                  >
                    <LogOut className="w-3 h-3" strokeWidth={1.8} />
                    Sign out
                  </button>
                </div>

                <div className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {['all', 'needs_correction', 'corrected', 'approved'].map((key) => {
                        const active = wishFilter === key;
                        const label = key === 'all' ? 'All' : key.replace('_', ' ');
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setWishFilter(key)}
                            className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase"
                            style={{
                              border: '1px solid var(--border2)',
                              color: active ? 'var(--special-accent)' : 'var(--fg2)',
                              background: active ? 'var(--special-bg)' : 'transparent',
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      {displayedWishes.map((wish, index) => {
                        const token = statusToken(wish.status);
                        const absoluteIndex = wishes.findIndex((item) => item.id === wish.id);
                        const displayIndex = absoluteIndex >= 0 ? absoluteIndex + 1 : index + 1;
                        return (
                          <div key={wish.id} className="rounded-xl p-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] tracking-[0.17em] uppercase" style={{ color: 'var(--fg3)' }}>Wish {displayIndex}</p>
                              <span className="text-[10px] tracking-[0.14em] uppercase px-2 py-1 rounded-full" style={token.style}>{token.label}</span>
                            </div>
                            <textarea
                              value={wish.text}
                              onChange={(e) => setWishText(wish.id, e.target.value)}
                              rows={3}
                              className="w-full mt-2 bg-transparent border-0 outline-none resize-y text-sm leading-relaxed"
                              style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)', paddingBottom: '10px' }}
                              placeholder="Type your wish..."
                            />
                            <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-[11px]" style={{ color: 'var(--fg3)' }}>{wish.text.length}/{MAX_WISH_LEN}</p>
                              {wish.admin_note ? (
                                <p className="text-xs" style={{ color: '#E8A58D' }}>Admin note: {wish.admin_note}</p>
                              ) : <span />}
                              <button
                                type="button"
                                onClick={() => removeWish(wish.id)}
                                disabled={wishes.length <= 1}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] tracking-[0.16em] uppercase disabled:opacity-45"
                                style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                              >
                                <Trash2 className="w-3 h-3" strokeWidth={1.8} />
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={addWish}
                      className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                      style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.9} />
                      Add wish
                    </button>
                  </div>

                  <div ref={paymentCardRef} className="rounded-xl p-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                    <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Pricing and checkout</p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCountryProfile('india')}
                        className="rounded-lg px-3 py-2 text-left"
                        style={{ border: countryProfile === 'india' ? '1px solid var(--accent)' : '1px solid var(--border2)', background: countryProfile === 'india' ? 'var(--accent-dim)' : 'transparent' }}
                      >
                        <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>India</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{PRICING.combinedHealings.india.label} / wish</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCountryProfile('outside_india')}
                        className="rounded-lg px-3 py-2 text-left"
                        style={{ border: countryProfile === 'outside_india' ? '1px solid var(--special-border)' : '1px solid var(--border2)', background: countryProfile === 'outside_india' ? 'var(--special-bg)' : 'transparent' }}
                      >
                        <p className="text-[10px] tracking-[0.16em] uppercase" style={{ color: 'var(--fg3)' }}>Outside India</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{PRICING.combinedHealings.international.label} / wish</p>
                      </button>
                    </div>

                    {!geoLoading && (
                      <p className="mt-2 text-[11px]" style={{ color: 'var(--fg3)' }}>
                        Auto-country: {countryCode || 'IN'} (manual override enabled)
                      </p>
                    )}

                    <div className="mt-4 rounded-lg p-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                      <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--fg3)' }}>Amount summary</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--fg2)' }}>{wishCount} wish x {wishUnitLabel}</p>
                      <p className="text-xl mt-1" style={{ color: 'var(--fg)' }}>{checkoutTotalLabel}</p>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <button
                        type="button"
                        onClick={saveNow}
                        disabled={saving}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase disabled:opacity-60"
                        style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Save draft
                      </button>

                      <button
                        type="button"
                        onClick={submitReview}
                        disabled={!canSubmitReview || reviewing}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase disabled:opacity-55"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        {allApproved ? 'All approved' : 'Send for review'}
                      </button>

                      <button
                        type="button"
                        onClick={startCheckout}
                        disabled={!canCheckout || checkoutStarting}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase disabled:opacity-55"
                        style={{
                          border: `1px solid ${allApproved ? 'var(--status-done-border)' : 'var(--border2)'}`,
                          color: allApproved ? 'var(--status-success-fg)' : 'var(--fg3)',
                        }}
                      >
                        {checkoutStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <WalletCards className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Checkout now
                      </button>

                      <button
                        type="button"
                        onClick={cancelRequest}
                        disabled={cancelling}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase disabled:opacity-55"
                        style={{ border: '1px solid rgba(224,138,111,0.45)', color: '#E8A58D' }}
                      >
                        {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />}
                        Cancel and delete
                      </button>
                    </div>

                    {countryProfile === 'outside_india' && (
                      <div className="mt-4 rounded-lg p-3" style={{ border: '1px solid var(--special-border)', background: 'var(--special-bg)' }}>
                        <p className="text-xs" style={{ color: 'var(--special-accent)' }}>{OUTSIDE_NOTICE}</p>
                        {!!checkoutRails.length && (
                          <div className="mt-2 space-y-1.5">
                            {checkoutRails.map((rail) => (
                              <div key={rail.id || rail.name} className="text-[11px]" style={{ color: 'var(--fg2)' }}>
                                {rail.name}: {rail.detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!!checkoutSessionId && (
                      <div className="mt-4 rounded-lg p-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>
                          Checkout session: {checkoutSessionStatus || 'awaiting payment'}
                        </p>
                        {checkoutQrSrc && (
                          <div className="mt-3 flex justify-center">
                            <div className="rounded-lg overflow-hidden p-2" style={{ border: '1px solid var(--border2)', background: '#fff', maxWidth: 'min(84vw, 280px)' }}>
                              <img src={checkoutQrSrc} alt="Combined Healings QR" className="block w-full h-auto aspect-square object-contain" />
                            </div>
                          </div>
                        )}
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => refreshCheckoutSession(checkoutSessionId)}
                            disabled={checkoutRefreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase disabled:opacity-55"
                            style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                          >
                            {checkoutRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.9} /> : <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} />}
                            Check status
                          </button>
                          {checkoutUpiIntent && (
                            <a
                              href={checkoutUpiIntent}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                              style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                              Open UPI app
                            </a>
                          )}
                        </div>
                        {checkoutNotice && (
                          <p className="mt-2 text-xs" style={{ color: checkoutSessionStatus === 'paid' ? 'var(--status-success-fg)' : 'var(--fg2)' }}>
                            {checkoutNotice}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {loadingRequest && (
                  <p className="mt-4 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--fg2)' }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />
                    Syncing latest request...
                  </p>
                )}

                {(error || notice) && (
                  <div className="mt-4">
                    {error && <p className="text-sm" style={{ color: '#E08A6F' }}>{error}</p>}
                    {notice && (
                      <p className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--accent-text)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                        {notice}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 rounded-lg p-3" style={{ border: '1px solid var(--border2)', background: 'var(--bg)' }}>
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Review progress</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--fg2)' }}>
                    Total review rounds: {requestRow?.review_count || 0}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--fg2)' }}>
                    Request status: {requestRow?.status || 'draft'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-xl px-5 py-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Combined Healings Notes</p>
            <p className="text-sm mt-2 font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
              Only the latest request state is retained for both client and admin interfaces. Once all wishes are approved, you can checkout or cancel and start fresh.
            </p>
            <div className="mt-3">
              <Link to={createPageUrl('Instant Consult')} className="inline-flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase" style={{ color: 'var(--accent-text)' }}>
                Need one-off guidance instead?
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

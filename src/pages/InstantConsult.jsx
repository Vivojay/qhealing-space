import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Mic,
  Send,
  WalletCards,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import Footer from '@/components/wellness/Footer';
import { apiUrl } from '@/utils';
import { firebaseAuth, firebaseConfigured, firebaseGoogleProvider } from '@/lib/firebaseClient';

const WAIT_NOTICE = 'Please wait for our reply (this may take up to 24 hours).';
const INSTANT_FEE_LABEL = '₹1,500';
const INSTANT_FEE_AMOUNT = 1500;
const PAYMENT_QR_SRC = apiUrl('/api/payments/upi-qr?amount=1500');

const REQUESTED_CONSULT_TYPES = [
  {
    id: 'grabovoy-codes',
    legacyTypeId: 'career-abundance',
    label: 'Grabovoy Codes',
    description: 'Numeric sequence guidance for healing intentions, restoration targets, and manifestation alignment.',
    accent: '#3E63AE',
    images: [
      {
        place: 'Sequence Grid Journal',
        src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85',
      },
      {
        place: 'Focused Number Meditation',
        src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=85',
      },
    ],
  },
  {
    id: 'sigil-witchcraft',
    legacyTypeId: 'spiritual-direction',
    label: 'Sigil Witchcraft',
    description: 'Personal sigil design, charging rituals, and symbolic intention work for precise outcomes.',
    accent: '#8A3A6D',
    images: [
      {
        place: 'Sigil Ritual Desk',
        src: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=1200&q=85',
      },
      {
        place: 'Candle Charge Window',
        src: 'https://images.unsplash.com/photo-1514516816566-de580c8f76b9?w=1200&q=85',
      },
    ],
  },
  {
    id: 'angel-cards',
    legacyTypeId: 'relationship-clarity',
    label: 'Angel Cards',
    description: 'Angel card spreads for reassurance, heart-led direction, and immediate intuitive clarity.',
    accent: '#B67A2A',
    images: [
      {
        place: 'Card Pull Session',
        src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=85',
      },
      {
        place: 'Guidance and Light',
        src: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=1200&q=85',
      },
    ],
  },
  {
    id: 'dowsing',
    legacyTypeId: 'health-energy',
    label: 'Dowsing',
    description: 'Pendulum and chart-based dowsing for energetic diagnostics, yes-no clarity, and alignment checks.',
    accent: '#1B7B70',
    images: [
      {
        place: 'Pendulum Inquiry',
        src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85',
      },
      {
        place: 'Subtle Energy Scan',
        src: 'https://images.unsplash.com/photo-1591348122449-02525d70379b?w=1200&q=85',
      },
    ],
  },
  {
    id: 'runes',
    legacyTypeId: 'spiritual-direction',
    label: 'Runes',
    description: 'Rune casting and interpretation for decision timing, energetic protection, and spiritual mapping.',
    accent: '#5D713F',
    images: [
      {
        place: 'Rune Cast Layout',
        src: 'https://images.unsplash.com/photo-1531171596281-8b5d26917d8b?w=1200&q=85',
      },
      {
        place: 'Symbolic Guidance Path',
        src: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200&q=85',
      },
    ],
  },
  {
    id: 'switchwords',
    legacyTypeId: 'career-abundance',
    label: 'Switchwords',
    description: 'Targeted switchword combinations for quick subconscious shifts and repeated intention activation.',
    accent: '#B3543C',
    images: [
      {
        place: 'Switchword Journal',
        src: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=85',
      },
      {
        place: 'Affirmation Practice Flow',
        src: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=85',
      },
    ],
  },
];

function statusPill(status) {
  const normalized = String(status || 'new').toLowerCase();
  if (normalized === 'done') {
    return {
      label: 'Done',
      style: { background: 'rgba(38, 132, 86, 0.18)', color: '#63E6A8', border: '1px solid rgba(99, 230, 168, 0.34)' },
    };
  }
  if (normalized === 'inprogress' || normalized === 'pending') {
    return {
      label: 'Pending',
      style: { background: 'rgba(168, 126, 47, 0.18)', color: '#F4D08F', border: '1px solid rgba(244, 208, 143, 0.34)' },
    };
  }
  return {
    label: 'New',
    style: { background: 'rgba(75, 121, 184, 0.18)', color: '#A6CBF5', border: '1px solid rgba(166, 203, 245, 0.34)' },
  };
}

function formatTs(value) {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Just now';
  return d.toLocaleString();
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

export default function InstantConsult() {
  const [searchParams] = useSearchParams();
  const onboardingCardRef = useRef(null);
  const paymentCardRef = useRef(null);

  const [types] = useState(REQUESTED_CONSULT_TYPES);
  const [selectedTypeId, setSelectedTypeId] = useState(REQUESTED_CONSULT_TYPES[0]?.id || '');
  const [typeSubmissionMode, setTypeSubmissionMode] = useState('modern');

  const [authUser, setAuthUser] = useState(null);
  const [idToken, setIdToken] = useState('');
  const [authMode, setAuthMode] = useState('signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [paymentReference, setPaymentReference] = useState('');
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [sendNotice, setSendNotice] = useState('');
  const [sendError, setSendError] = useState('');

  const selectedType = useMemo(
    () => types.find((type) => type.id === selectedTypeId) || types[0] || null,
    [types, selectedTypeId],
  );

  const requestedMode = useMemo(
    () => String(searchParams.get('mode') || '').trim().toLowerCase(),
    [searchParams],
  );

  const consultAccent = selectedType?.accent || 'var(--accent)';

  const bringPanelIntoView = useCallback((panel) => {
    const target = panel === 'signup' ? onboardingCardRef.current : paymentCardRef.current;
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      const focusNode = target.querySelector('input, textarea') || target.querySelector('button');
      if (focusNode && typeof focusNode.focus === 'function') {
        focusNode.focus({ preventScroll: true });
      }
    }, panel === 'signup' ? 260 : 220);
  }, []);

  const nudgeSignup = useCallback(() => {
    setAuthMode('signup');
    setAuthError('');
    bringPanelIntoView('signup');
  }, [bringPanelIntoView]);

  const nudgePayment = useCallback(() => {
    bringPanelIntoView('payment');
  }, [bringPanelIntoView]);

  useEffect(() => {
    if (requestedMode !== 'signup' || authUser) return;
    const timer = setTimeout(() => {
      nudgeSignup();
    }, 120);
    return () => clearTimeout(timer);
  }, [requestedMode, authUser, nudgeSignup]);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/consult/types'))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        const remote = Array.isArray(payload?.data) ? payload.data : [];
        const remoteIds = new Set(remote.map((item) => item?.id).filter(Boolean));
        const supportsModernIds = REQUESTED_CONSULT_TYPES.every((item) => remoteIds.has(item.id));
        setTypeSubmissionMode(supportsModernIds ? 'modern' : 'legacy');
      })
      .catch(() => {
        if (cancelled) return;
        setTypeSubmissionMode('legacy');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setAuthUser(user);
      if (user) {
        const token = await getIdToken(user, true);
        setIdToken(token);
      } else {
        setIdToken('');
      }
    });
    return () => unsub();
  }, []);

  const loadMessages = useCallback(async (tokenOverride, { quiet = false } = {}) => {
    const token = tokenOverride || idToken;
    if (!token) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await fetch(apiUrl('/api/consult/my-messages?limit=60'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();
      setMessages(payload?.data || []);
    } catch (err) {
      if (!quiet) setSendError(err.message || 'Failed to load your consult history.');
    } finally {
      setLoadingMessages(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (!idToken) {
      setMessages([]);
      return;
    }
    loadMessages(idToken);
  }, [idToken, loadMessages]);

  useEffect(() => {
    if (!idToken) return undefined;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages(idToken, { quiet: true });
    }, 9000);
    return () => clearInterval(timer);
  }, [idToken, loadMessages]);

  const onGoogleAuth = async () => {
    if (!firebaseConfigured || !firebaseAuth || !firebaseGoogleProvider) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const cred = await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
      const token = await getIdToken(cred.user, true);
      setIdToken(token);
      setAuthUser(cred.user);
      await loadMessages(token);
      setSendNotice('Sign-in successful. Complete payment to unlock one message.');
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const onEmailAuth = async (event) => {
    event.preventDefault();
    if (!firebaseConfigured || !firebaseAuth) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      let userCred;
      if (authMode === 'signup') {
        userCred = await createUserWithEmailAndPassword(firebaseAuth, authForm.email.trim(), authForm.password);
        if (authForm.name.trim()) {
          await updateProfile(userCred.user, { displayName: authForm.name.trim() });
        }
      } else {
        userCred = await signInWithEmailAndPassword(firebaseAuth, authForm.email.trim(), authForm.password);
      }
      const token = await getIdToken(userCred.user, true);
      setIdToken(token);
      setAuthUser(userCred.user);
      await loadMessages(token);
      setSendNotice('Account ready. Complete payment to unlock one message.');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const onSignOut = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    setAuthUser(null);
    setIdToken('');
    setMessages([]);
    setPaymentUnlocked(false);
    setPaymentReference('');
    setPaymentNotice('');
    setSendNotice('');
  };

  const unlockPayment = () => {
    const ref = paymentReference.trim();
    if (ref.length < 6) {
      setPaymentNotice('Enter a valid payment reference (UTR / transaction ID).');
      return;
    }
    setPaymentUnlocked(true);
    setPaymentNotice('Payment reference captured. You can now send one Instant Consult message.');
  };

  const startVoiceCapture = () => {
    if (listening) return;
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SpeechRecognition) {
      setSendError('Voice input is not supported in this browser.');
      return;
    }

    setSendError('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalChunk += `${transcript} `;
      }
      if (finalChunk.trim()) {
        setDraft((prev) => [prev.trim(), finalChunk.trim()].filter(Boolean).join(' ').trim());
      }
    };
    recognition.onerror = () => {
      setSendError('Could not capture voice input. Please try again or type manually.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    if (!idToken || !selectedType || sending) return;

    const question = draft.trim();
    if (question.length < 8) {
      setSendError('Please enter a clearer question (minimum 8 characters).');
      return;
    }
    if (!paymentUnlocked) {
      setSendError('Complete the ₹1,500 payment step before sending your message.');
      return;
    }

    setSending(true);
    setSendError('');
    setSendNotice('');

    const resolvedTypeId =
      typeSubmissionMode === 'legacy'
        ? (selectedType.legacyTypeId || selectedType.id)
        : selectedType.id;

    try {
      const res = await fetch(apiUrl('/api/consult/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          type_id: resolvedTypeId,
          question,
          payment_reference: paymentReference.trim(),
          payment_amount: INSTANT_FEE_AMOUNT,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const payload = await res.json();

      setDraft('');
      setPaymentUnlocked(false);
      setPaymentReference('');
      setPaymentNotice('A fresh ₹1,500 payment is required for the next message.');
      setSendNotice(payload.client_notice || WAIT_NOTICE);
      await loadMessages();
    } catch (err) {
      setSendError(err.message || 'Failed to send your consult message.');
    } finally {
      setSending(false);
    }
  };

  const chatLocked = !authUser || !paymentUnlocked;
  const lockPromptAction = !authUser ? nudgeSignup : nudgePayment;
  const lockPromptLabel = !authUser ? 'Signup Required' : 'Payment Required';
  const lockPromptHint = !authUser ? 'Tap to start signup' : 'Tap to complete payment';

  return (
    <div style={{ background: 'var(--bg)' }}>
      <section className="relative overflow-hidden py-16 lg:py-20" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 82% 20%, rgba(224,106,106,0.16), transparent 52%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <p className="text-[10px] tracking-[0.42em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>
            Instant Consult
          </p>
          <h1 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
            Ask now,
            <span style={{ color: consultAccent, marginLeft: '0.35ch' }}>receive depth.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-sm lg:text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
            This is a dedicated paid consult channel (separate from quick chat). Every message is reviewed personally and answered with clear text plus curated supporting images.
          </p>
          {!authUser && (
            <div className="mt-6">
              <button
                type="button"
                onClick={nudgeSignup}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] tracking-[0.22em] uppercase"
                style={{ background: 'var(--special-accent)', color: '#fff' }}
              >
                Sign up to unlock chat
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.9} />
              </button>
            </div>
          )}
          <div
            className="mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: 'var(--special-bg)', border: '1px solid var(--special-border)', color: 'var(--special-accent)' }}
          >
            <ImagePlus className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="text-[10px] tracking-[0.2em] uppercase">Responses include text + relevant pictures</span>
          </div>
        </div>
      </section>

      <section className="relative py-12 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2.5">
            {types.map((type) => {
              const active = type.id === selectedType?.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedTypeId(type.id)}
                  className="px-4 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all"
                  style={{
                    border: `1px solid ${active ? type.accent : 'var(--border2)'}`,
                    background: active ? `${type.accent}20` : 'var(--bg-elev)',
                    color: active ? type.accent : 'var(--fg2)',
                  }}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {selectedType && (
            <motion.div
              key={selectedType.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-7 rounded-2xl p-5 lg:p-7 relative overflow-hidden"
              style={{ border: `1px solid ${selectedType.accent}55`, background: 'var(--bg-elev)' }}
            >
              <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full" style={{ background: `${selectedType.accent}1f` }} />
              <h2 className="hero-display text-3xl lg:text-4xl relative" style={{ color: 'var(--fg)' }}>{selectedType.label}</h2>
              <p
                className="mt-4 inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px]"
                style={{ background: `${selectedType.accent}22`, border: `1px solid ${selectedType.accent}77`, color: 'var(--fg2)' }}
              >
                {selectedType.description}
              </p>

              <div className="mt-6 grid md:grid-cols-2 gap-4 relative">
                {(selectedType.images || []).slice(0, 2).map((img) => (
                  <div key={`${selectedType.id}-${img.place}`} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
                    <div className="aspect-[16/9] relative">
                      <img src={img.src} alt={img.place} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,11,18,0.7), transparent 64%)' }} />
                      <p className="absolute left-3 bottom-3 text-[10px] tracking-[0.22em] uppercase" style={{ color: '#fff' }}>
                        {img.place} · Indicative
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {!firebaseConfigured ? (
              <div className="rounded-2xl p-5" style={{ border: '1px solid rgba(224,106,106,0.4)', background: 'rgba(224,106,106,0.08)' }}>
                <p className="text-sm" style={{ color: 'var(--fg)' }}>Instant Consult auth is not configured yet.</p>
                <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                  Set Firebase frontend env vars to enable email and Google sign-in.
                </p>
              </div>
            ) : !authUser ? (
              <div ref={onboardingCardRef} className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Onboarding</p>
                <h3 className="text-2xl mt-2" style={{ color: 'var(--fg)' }}>Sign up to unlock Instant Consult</h3>
                <div className="mt-4 flex gap-2">
                  {['signup', 'login'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setAuthMode(mode); setAuthError(''); }}
                      className="px-3 py-2 rounded-lg text-[11px] tracking-[0.2em] uppercase"
                      style={{
                        border: '1px solid var(--border2)',
                        background: authMode === mode ? 'var(--accent-soft)' : 'transparent',
                        color: authMode === mode ? 'var(--accent-text)' : 'var(--fg2)',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <form className="mt-4 space-y-3" onSubmit={onEmailAuth}>
                  {authMode === 'signup' && (
                    <div>
                      <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Full name</label>
                      <input
                        value={authForm.name}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                        style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                        placeholder="Your name"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Email</label>
                    <input
                      value={authForm.email}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                      type="email"
                      required
                      className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Password</label>
                    <input
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                      type="password"
                      required
                      className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                      style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
                    {authMode === 'signup' ? 'Create account' : 'Login'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onGoogleAuth}
                  disabled={authLoading}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase"
                  style={{ border: '1px solid var(--border2)', color: 'var(--fg2)', background: 'var(--bg)' }}
                >
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.9} />
                  Continue with Google
                </button>

                {authError && (
                  <p className="mt-3 text-xs" style={{ color: '#E08A6F' }}>{authError}</p>
                )}
              </div>
            ) : (
              <div ref={paymentCardRef} className="rounded-2xl p-5 lg:p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--special-accent)' }}>Payment Gate</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl" style={{ color: 'var(--fg)' }}>{authUser.displayName || authUser.email}</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--fg2)' }}>One message unlock per payment.</p>
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

                <div className="mt-4 rounded-xl p-4" style={{ border: '1px solid var(--border2)', background: '#fff' }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: '#5b6b85' }}>Pay with Paytm</span>
                    <span className="text-sm font-semibold" style={{ color: '#002E6E' }}>{INSTANT_FEE_LABEL}</span>
                  </div>
                  <div className="mt-3 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,46,110,0.22)' }}>
                    <img src={PAYMENT_QR_SRC} alt="Instant consult Paytm QR" className="w-full h-auto block" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--fg3)' }}>Payment reference (UTR / Txn ID)</label>
                  <input
                    value={paymentReference}
                    onChange={(e) => { setPaymentReference(e.target.value); setPaymentNotice(''); }}
                    placeholder="e.g. T202604..."
                    className="w-full mt-1 bg-transparent border-0 outline-none text-sm pb-2"
                    style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)' }}
                  />
                  <button
                    type="button"
                    onClick={unlockPayment}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase"
                    style={{ border: `1px solid ${paymentUnlocked ? '#63E6A8' : 'var(--special-border)'}`, color: paymentUnlocked ? '#63E6A8' : 'var(--special-accent)' }}
                  >
                    {paymentUnlocked ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> : <WalletCards className="w-3.5 h-3.5" strokeWidth={1.8} />}
                    {paymentUnlocked ? 'Unlocked for one message' : 'I have paid'}
                  </button>
                  {paymentNotice && (
                    <p className="mt-2 text-xs" style={{ color: paymentUnlocked ? '#63E6A8' : 'var(--fg2)' }}>{paymentNotice}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 rounded-2xl overflow-hidden relative" style={{ border: `1px solid ${selectedType?.accent || 'var(--border2)'}`, background: 'var(--bg-elev)' }}>
            <div className="px-5 lg:px-6 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Instant Consult DM</p>
                <p className="text-sm mt-1" style={{ color: 'var(--fg)' }}>{selectedType?.label || 'Select a consult type'}</p>
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ background: `${consultAccent}1c`, border: `1px solid ${consultAccent}66`, color: consultAccent }}>
                {INSTANT_FEE_LABEL} / message
              </span>
            </div>

            <div className="relative">
              <div className={`${chatLocked ? 'blur-[2px] pointer-events-none select-none' : ''}`}>
                <div className="h-[360px] lg:h-[430px] overflow-y-auto px-4 lg:px-5 py-4 space-y-3" style={{ background: 'var(--bg)' }}>
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--fg3)' }} />
                    </div>
                  ) : messages.length ? (
                    messages.map((msg) => {
                      const pill = statusPill(msg.status);
                      return (
                        <div key={msg.id} className="space-y-2">
                          <div className="flex justify-end">
                            <div
                              className="max-w-[88%] rounded-2xl rounded-br-md px-4 py-3"
                              style={{ background: `${consultAccent}26`, border: `1px solid ${consultAccent}55`, color: 'var(--fg)' }}
                            >
                              <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.question}</p>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="max-w-[88%] rounded-2xl rounded-bl-md px-3.5 py-2.5" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-full" style={pill.style}>
                                  {pill.label}
                                </span>
                                <span className="text-[11px]" style={{ color: 'var(--fg2)' }}>{formatTs(msg.created_at)}</span>
                              </div>
                              <p className="text-xs mt-2" style={{ color: 'var(--fg2)' }}>
                                {msg.admin_reply?.text
                                  ? 'Admin reply delivered below.'
                                  : msg.status === 'done'
                                    ? 'Your response is ready. Please check your channel updates from our team.'
                                    : WAIT_NOTICE}
                              </p>
                            </div>
                          </div>

                          {msg.admin_reply?.text && (
                            <div className="flex justify-start">
                              <div className="max-w-[90%] rounded-2xl rounded-bl-md px-3.5 py-3" style={{ border: `1px solid ${consultAccent}66`, background: `${consultAccent}1a` }}>
                                <p className="text-[11px] tracking-[0.18em] uppercase" style={{ color: consultAccent }}>Vartika's Reply</p>
                                <p className="mt-2 text-sm font-light leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fg)' }}>
                                  {msg.admin_reply.text}
                                </p>
                                {!!msg.admin_reply.images?.length && (
                                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {msg.admin_reply.images.filter((img) => img.url).map((img, idx) => (
                                      <a
                                        key={`${msg.id}-reply-image-${idx}`}
                                        href={img.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded overflow-hidden"
                                        style={{ border: '1px solid var(--border2)' }}
                                      >
                                        <img src={img.url} alt={img.name || `reply-${idx + 1}`} className="w-full h-24 object-cover" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                <p className="mt-2 text-[11px]" style={{ color: 'var(--fg2)' }}>
                                  {formatTs(msg.admin_reply.replied_at)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center px-6 text-center">
                      <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                        No messages yet. Complete onboarding and payment to send your first Instant Consult DM.
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={submitMessage} className="px-4 lg:px-5 py-4" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elev)' }}>
                  <label className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>
                    Your Question
                  </label>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Type your question clearly. You may also use your device voice-to-text keyboard input."
                    className="w-full mt-2 bg-transparent border-0 outline-none resize-none text-sm leading-relaxed"
                    style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border2)', paddingBottom: '10px' }}
                    disabled={sending}
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs font-light" style={{ color: 'var(--fg3)' }}>
                      Every sent DM requires a fresh {INSTANT_FEE_LABEL} payment.
                    </p>
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startVoiceCapture}
                        disabled={listening}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase"
                        style={{ border: '1px solid var(--border2)', color: listening ? 'var(--accent-text)' : 'var(--fg2)' }}
                      >
                        <Mic className="w-3.5 h-3.5" strokeWidth={1.8} />
                        {listening ? 'Listening' : 'Voice'}
                      </button>
                      <button
                        type="submit"
                        disabled={sending || !draft.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase"
                        style={{ background: consultAccent, color: '#fff' }}
                      >
                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> : <Send className="w-3.5 h-3.5" strokeWidth={1.9} />}
                        Send DM
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <AnimatePresence>
                {chatLocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center px-6"
                    style={{ background: 'rgba(10, 14, 21, 0.24)' }}
                  >
                    <button
                      type="button"
                      onClick={lockPromptAction}
                      className="orbit-circle-cta w-40 h-40 rounded-full flex flex-col items-center justify-center text-center"
                      style={{
                        '--orbit-ring': !authUser ? 'var(--special-accent)' : consultAccent,
                        border: `1px solid ${!authUser ? 'var(--special-border)' : `${consultAccent}88`}`,
                        background: 'rgba(12, 18, 28, 0.55)',
                        backdropFilter: 'blur(4px)',
                      }}
                      aria-label={lockPromptHint}
                    >
                      {!authUser ? <Lock className="w-7 h-7" style={{ color: 'var(--special-accent)' }} strokeWidth={1.7} /> : <WalletCards className="w-7 h-7" style={{ color: consultAccent }} strokeWidth={1.7} />}
                      <p className="text-[10px] tracking-[0.2em] uppercase mt-3" style={{ color: !authUser ? 'var(--special-accent)' : consultAccent }}>
                        {lockPromptLabel}
                      </p>
                      <p className="text-[9px] mt-1.5" style={{ color: 'var(--fg2)' }}>{lockPromptHint}</p>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {(sendError || sendNotice) && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-6">
            {sendError && <p className="text-sm" style={{ color: '#E08A6F' }}>{sendError}</p>}
            {sendNotice && (
              <p className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--accent-text)' }}>
                <Clock3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                {sendNotice}
              </p>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8">
          <div className="rounded-xl px-5 py-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <p className="text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--fg3)' }}>Service Disclaimer</p>
            <p className="text-sm mt-2 font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
              Each Instant Consult reply may include written interpretation, guidance notes, and supporting images where relevant. Typical response window is up to 24 hours.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

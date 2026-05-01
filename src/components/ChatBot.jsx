import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { apiUrl } from '@/utils';

const SESSION_KEY = 'qhs_site_chat_session_id';
const SEND_THROTTLE_MS = 900;
const THREAD_REFRESH_MS = 12000;

function unreadKey(sessionId) {
  return `qhs_site_chat_last_seen_admin_at:${sessionId}`;
}

function readLastSeenAdminAt(sessionId) {
  if (typeof window === 'undefined' || !sessionId) return '';
  return window.localStorage.getItem(unreadKey(sessionId)) || '';
}

function writeLastSeenAdminAt(sessionId, value) {
  if (typeof window === 'undefined' || !sessionId) return;
  if (value) window.localStorage.setItem(unreadKey(sessionId), value);
}

function latestAdminTimestamp(messages) {
  if (!Array.isArray(messages)) return '';
  return messages.reduce((latest, item) => {
    if (item?.sender !== 'admin') return latest;
    const createdAt = String(item?.created_at || '').trim();
    return createdAt > latest ? createdAt : latest;
  }, '');
}

function ensureSessionId() {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = `sc_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [thread, setThread] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const lastSendAtRef = useRef(0);

  useEffect(() => {
    const nextSessionId = ensureSessionId();
    setSessionId(nextSessionId);
    setUnreadCount(0);
  }, []);

  const reconcileUnread = useCallback((nextThread, { markSeen = false } = {}) => {
    const messages = Array.isArray(nextThread?.messages) ? nextThread.messages : [];
    const latestAdminAt = latestAdminTimestamp(messages);
    if (!latestAdminAt) {
      setUnreadCount(0);
      return;
    }

    if (markSeen) {
      writeLastSeenAdminAt(sessionId, latestAdminAt);
      setUnreadCount(0);
      return;
    }

    const lastSeenAdminAt = readLastSeenAdminAt(sessionId);
    const nextUnread = messages.filter(
      (item) => item?.sender === 'admin' && String(item?.created_at || '') > lastSeenAdminAt,
    ).length;
    setUnreadCount(nextUnread);
  }, [sessionId]);

  const bootstrapSession = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/site-chat/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.detail || `HTTP ${res.status}`);
      const nextThread = payload?.data || null;
      setThread(nextThread);
      reconcileUnread(nextThread, { markSeen: open });
    } catch (err) {
      setError(err.message || 'Could not open chat right now.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, reconcileUnread, open]);

  const refreshThread = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(apiUrl(`/api/site-chat/session/${encodeURIComponent(sessionId)}`));
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.detail || `HTTP ${res.status}`);
      const nextThread = payload?.data || null;
      setThread(nextThread);
      reconcileUnread(nextThread, { markSeen: open });
    } catch (err) {
      setError(err.message || 'Could not refresh chat.');
    }
  }, [sessionId, reconcileUnread, open]);

  useEffect(() => {
    if (!open || !sessionId) return;
    bootstrapSession();
  }, [open, sessionId, bootstrapSession]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      refreshThread();
    }, THREAD_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [sessionId, refreshThread]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [open, thread?.messages?.length]);

  useEffect(() => {
    if (!open || !thread) return;
    reconcileUnread(thread, { markSeen: true });
  }, [open, thread, reconcileUnread]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const messages = useMemo(() => (
    Array.isArray(thread?.messages) && thread.messages.length
      ? thread.messages
      : [{
        id: 'intro',
        sender: 'admin',
        text: 'Welcome. Send your question here and our team can reply from the admin desk.',
        created_at: null,
      }]
  ), [thread]);

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    const now = Date.now();
    if (now - lastSendAtRef.current < SEND_THROTTLE_MS) return;
    lastSendAtRef.current = now;
    setSending(true);
    setError('');
    try {
      const res = await fetch(apiUrl(`/api/site-chat/session/${encodeURIComponent(sessionId)}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.detail || `HTTP ${res.status}`);
      const nextThread = payload?.data || null;
      setThread(nextThread);
      reconcileUnread(nextThread, { markSeen: true });
      setInput('');
    } catch (err) {
      setError(err.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 lg:right-8 w-[360px] max-w-[calc(100vw-2.5rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', zIndex: 9000 }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg3)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--fg2)' }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>QHS Main Chat</p>
                  <p className="text-[10px]" style={{ color: 'var(--fg3)' }}>Anonymous chat synced with admin</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:opacity-60 transition-opacity">
                <X className="w-4 h-4" style={{ color: 'var(--fg2)' }} />
              </button>
            </div>

            <div className="h-[320px] overflow-y-auto px-4 py-4 space-y-3" data-lenis-prevent>
              {loading ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg2)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} />
                  Opening chat…
                </div>
              ) : messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] px-4 py-2.5 rounded-xl text-xs font-light leading-relaxed whitespace-pre-line"
                    style={{
                      background: msg.sender === 'client' ? 'var(--fg3)' : 'var(--bg3)',
                      color: 'var(--fg)',
                      borderRadius: msg.sender === 'client' ? '1rem 1rem 0.3rem 1rem' : '1rem 1rem 1rem 0.3rem',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-2">
              {error ? <p className="text-[11px]" style={{ color: '#E8A58D' }}>{error}</p> : <p className="text-[11px]" style={{ color: 'var(--fg3)' }}>Replies from admin will appear here automatically.</p>}
            </div>

            <div className="px-4 py-3 flex gap-3 items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type your message…"
                className="flex-1 bg-transparent text-xs outline-none font-light placeholder:opacity-30"
                style={{ color: 'var(--fg)' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-opacity disabled:opacity-20"
                style={{ background: 'var(--fg3)' }}
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--fg)' }} /> : <Send className="w-3.5 h-3.5" style={{ color: 'var(--fg)' }} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 lg:right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: 'var(--fg)', zIndex: 9000 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 rounded-full inline-flex items-center justify-center text-[10px] font-medium"
            style={{ background: '#D95C5C', color: '#fff', border: '2px solid var(--bg)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}

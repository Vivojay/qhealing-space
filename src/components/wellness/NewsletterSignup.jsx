import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'loading') return;
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setState('loading');
    setMessage('');
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'footer' }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        const detail = typeof body.detail === 'string'
          ? body.detail
          : (Array.isArray(body.detail) ? body.detail[0]?.msg : null) || 'Subscription failed.';
        throw new Error(detail);
      }
      setState('success');
      setMessage(body.already_subscribed
        ? "You're already on the list — thank you."
        : "You're in. Watch your inbox for gentle dispatches.");
    } catch (err) {
      setState('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isLoading = state === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="rounded-full"
      style={{
        border: '1px solid var(--border2)',
        background: 'linear-gradient(90deg, var(--accent-dim), transparent 35%, var(--accent-dim))',
      }}
    >
      <form
        onSubmit={submit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 px-3 sm:px-5 py-2.5"
      >
        <div
          className="flex items-center gap-2.5 pl-1 pr-3 sm:border-r"
          style={{ borderColor: 'var(--border2)' }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ border: '1px solid var(--border2)' }}
          >
            <Mail className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.6} />
          </span>
          <span
            className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase whitespace-nowrap"
            style={{ color: 'var(--fg3)' }}
          >
            Newsletter
          </span>
        </div>

        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Receive gentle dispatches — your email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state !== 'idle') { setState('idle'); setMessage(''); } }}
          disabled={isLoading || isSuccess}
          className="flex-1 bg-transparent outline-none border-0 text-sm font-light placeholder:opacity-60 disabled:opacity-70 px-1 py-1"
          style={{ color: 'var(--fg)' }}
        />

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isSuccess ? 'transparent' : 'var(--accent)',
            color: isSuccess ? 'var(--accent-text)' : '#fff',
            border: isSuccess ? '1px solid var(--accent)' : '1px solid var(--accent)',
          }}
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
          {isSuccess && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
          {!isLoading && !isSuccess && <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />}
          {isLoading ? 'Sending' : isSuccess ? 'Subscribed' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-light flex items-center gap-2 px-6 pb-3"
          style={{ color: isError ? '#E08A6F' : 'var(--fg2)' }}
        >
          {isError && <AlertCircle className="w-3 h-3 flex-shrink-0" strokeWidth={2} />}
          {isSuccess && <Check className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-text)' }} strokeWidth={2} />}
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

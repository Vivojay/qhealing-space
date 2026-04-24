import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { adminApi, setToken } from './api';

export default function AdminLogin({ onAuthed }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const r = await adminApi.login(password);
      setToken(r.token);
      onAuthed();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
          >
            <Lock className="w-4 h-4" style={{ color: 'var(--accent-text)' }} strokeWidth={1.6} />
          </div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>
            ◊ Admin
          </p>
          <h1 className="hero-display text-4xl mb-2" style={{ color: 'var(--fg)' }}>
            Quantum{' '}
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent-text)' }}>
              Healing Space
            </span>
          </h1>
          <p className="text-sm font-light" style={{ color: 'var(--fg2)' }}>
            Sign in to manage the site.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
          }}
        >
          <label className="block text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoFocus
            autoComplete="current-password"
            placeholder="Enter admin password"
            className="w-full bg-transparent border-0 outline-none text-base font-light placeholder:opacity-40 mb-1 pb-2.5"
            style={{
              color: 'var(--fg)',
              borderBottom: '1px solid var(--border2)',
            }}
          />

          {error && (
            <div className="flex items-start gap-2 mt-4 text-xs font-light" style={{ color: '#E08A6F' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[11px] tracking-[0.22em] uppercase transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />}
            {loading ? 'Signing in' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[10px] tracking-[0.28em] uppercase mt-6" style={{ color: 'var(--fg3)' }}>
          Authorised personnel only
        </p>
      </motion.div>
    </div>
  );
}

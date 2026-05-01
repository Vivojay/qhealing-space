import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Instagram,
  MessageCircle,
  MessagesSquare,
  Layers3,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { adminApi } from './api';

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] tracking-[0.28em] uppercase" style={{ color: 'var(--fg3)' }}>
          {label}
        </p>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: accent ? 'var(--accent-soft)' : 'var(--accent-dim)',
            border: '1px solid var(--border2)',
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} strokeWidth={1.8} />
        </span>
      </div>
      <p className="hero-display text-4xl mb-1" style={{ color: 'var(--fg)' }}>{value}</p>
      {sub ? <p className="text-xs font-light" style={{ color: 'var(--fg2)' }}>{sub}</p> : null}
    </motion.div>
  );
}

function StatusRow({ label, ok, detail }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        {ok ? (
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-text)' }} strokeWidth={1.8} />
        ) : (
          <AlertCircle className="w-4 h-4" style={{ color: '#E08A6F' }} strokeWidth={1.8} />
        )}
        <span className="text-sm font-light" style={{ color: 'var(--fg)' }}>{label}</span>
      </div>
      <span className="text-xs font-light" style={{ color: 'var(--fg2)' }}>{detail}</span>
    </div>
  );
}

function fmtTime(ts) {
  if (!ts) return 'Never';
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = new Date(ms);
  return d.toLocaleString();
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    setError('');
    try {
      const m = await adminApi.metrics();
      setMetrics(m);
    } catch (e) {
      setError(e.message || 'Failed to load metrics');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--fg2)' }}>
        <p className="mb-2 text-sm" style={{ color: '#E08A6F' }}>Could not load metrics</p>
        <p className="text-xs">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 text-[11px] tracking-[0.22em] uppercase rounded-full" style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading...</div>;
  }

  const ig = metrics.instagram || {};
  const consult = metrics.instant_consult || {};
  const siteChat = metrics.site_chat || {};
  const combined = metrics.combined_healings || {};

  return (
    <div>
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>Overview</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Dashboard</h1>
          <p className="text-sm font-light mt-2" style={{ color: 'var(--fg2)' }}>
            Last refreshed: {fmtTime(metrics.server_time && new Date(metrics.server_time).getTime() / 1000)}
          </p>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase hover-accent disabled:opacity-50"
          style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        <StatCard
          label="Newsletter"
          value={metrics.newsletter_subscribers}
          sub={metrics.newsletter_subscribers === 1 ? 'subscriber' : 'subscribers'}
          icon={Users}
          accent
        />
        <StatCard
          label="Instagram"
          value={ig.cached_items || 0}
          sub={`${ig.curated_count || 0} curated, TTL ${(ig.cache_ttl_seconds || 600) / 60} min`}
          icon={Instagram}
        />
        <StatCard
          label="Last Sync"
          value={ig.last_fetched_at ? fmtTime(ig.last_fetched_at).split(',')[1]?.trim() || '-' : '-'}
          sub={ig.last_fetched_at ? new Date((ig.last_fetched_at < 1e12 ? ig.last_fetched_at * 1000 : ig.last_fetched_at)).toLocaleDateString() : 'No sync yet'}
          icon={Clock}
        />
        <StatCard
          label="Instant Consult"
          value={consult.new || 0}
          sub={`${consult.inprogress || 0} in progress, ${consult.done || 0} done`}
          icon={MessageCircle}
        />
        <StatCard
          label="Site Chat"
          value={siteChat.new || 0}
          sub={`${siteChat.pending || 0} pending, ${siteChat.done || 0} done`}
          icon={MessagesSquare}
        />
        <StatCard
          label="Combined Healings"
          value={combined.in_review || 0}
          sub={`${combined.needs_correction || 0} needs correction, ${combined.checkout_paid || 0} paid`}
          icon={Layers3}
        />
      </div>

      <h2 className="text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>System Status</h2>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <StatusRow label="Firebase Firestore" ok={metrics.firebase_configured} detail={metrics.firebase_configured ? 'Connected' : 'Not configured'} />
        <StatusRow label="Instagram Graph API" ok={ig.configured} detail={ig.configured ? 'Token present' : 'Token missing'} />
        <StatusRow label="Site config" ok detail={metrics.config_source === 'firestore' ? 'Loaded from Firestore' : 'Using defaults'} />
      </div>
    </div>
  );
}

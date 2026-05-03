import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Instagram, Mail, MessageSquare, Layers3, MessagesSquare, Settings, LogOut, ExternalLink, NotebookPen } from 'lucide-react';
import { adminApi, clearToken } from './api';

const TABS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/instagram', label: 'Instagram', icon: Instagram },
  { to: '/admin/blogs', label: 'Blogs', icon: NotebookPen },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/instant-consult', label: 'Instant Consult', icon: MessageSquare },
  { to: '/admin/site-chat', label: 'Site Chat', icon: MessagesSquare },
  { to: '/admin/combined-healings', label: 'Combined Healings', icon: Layers3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children, onSignOut }) {
  const [badges, setBadges] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const metrics = await adminApi.metrics();
        if (!cancelled) {
          setBadges(metrics?.admin_badges || {});
        }
      } catch {
        if (!cancelled) setBadges({});
      }
    };
    load();
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      load();
    }, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const handleSignOut = () => {
    clearToken();
    if (onSignOut) onSignOut();
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      {/* Sidebar */}
      <aside
        className="lg:w-64 lg:min-h-screen flex-shrink-0 flex flex-col"
        style={{ background: 'var(--bg-elev)', borderRight: '1px solid var(--border)' }}
      >
        <div className="p-6 lg:p-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[9px] tracking-[0.45em] uppercase mb-2" style={{ color: 'var(--accent-text)' }}>
            ◊ Admin
          </p>
          <h2 className="hero-display text-xl leading-tight" style={{ color: 'var(--fg)' }}>
            Quantum{' '}
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent-text)' }}>
              Healing
            </span>
          </h2>
        </div>

        <nav className="flex-1 p-4 lg:p-6">
          <div className="flex lg:flex-col gap-1 lg:gap-1.5 overflow-x-auto lg:overflow-visible">
            {TABS.map(({ to, label, icon: Icon, end }) => {
              const badgeKey = to === '/admin/newsletter'
                ? 'newsletter'
                : to === '/admin/blogs'
                  ? 'blogs'
                : to === '/admin/instant-consult'
                  ? 'instant_consult'
                  : to === '/admin/site-chat'
                    ? 'site_chat'
                    : to === '/admin/combined-healings'
                      ? 'combined_healings'
                      : '';
              const badgeValue = badgeKey ? Number(badges?.[badgeKey] || 0) : 0;
              return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[12px] tracking-[0.06em] whitespace-nowrap transition-colors ${
                    isActive ? 'admin-nav-active' : 'admin-nav-inactive'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />
                <span className="font-light">{label}</span>
                {badgeValue > 0 && (
                  <span
                    className="ml-auto min-w-[24px] h-5 px-1.5 rounded-full inline-flex items-center justify-center text-[10px] tracking-[0.04em]"
                    style={{ background: 'var(--special-bg)', border: '1px solid var(--special-border)', color: 'var(--special-accent)' }}
                  >
                    {badgeValue > 99 ? '99+' : badgeValue}
                  </span>
                )}
              </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-4 lg:p-6 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
          <a
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 text-[11px] tracking-[0.18em] uppercase hover:opacity-80 transition-opacity mb-2"
            style={{ color: 'var(--fg2)' }}
          >
            <ExternalLink className="w-3 h-3" strokeWidth={1.8} />
            View site
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-[11px] tracking-[0.18em] uppercase hover-accent rounded-lg"
            style={{ color: 'var(--fg2)', border: '1px solid var(--border2)' }}
          >
            <LogOut className="w-3 h-3" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="px-6 py-8 lg:px-12 lg:py-12 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

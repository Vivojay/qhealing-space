import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminInstagram from '@/components/admin/AdminInstagram';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import AdminInstantConsult from '@/components/admin/AdminInstantConsult';
import AdminCombinedHealings from '@/components/admin/AdminCombinedHealings';
import AdminSettings from '@/components/admin/AdminSettings';
import { adminApi, getToken, clearToken } from '@/components/admin/api';

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [verifying, setVerifying] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) { setVerifying(false); return; }
    let cancelled = false;
    adminApi.me()
      .then(() => { if (!cancelled) setAuthed(true); })
      .catch(() => { if (!cancelled) { clearToken(); setAuthed(false); } })
      .finally(() => { if (!cancelled) setVerifying(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = () => setAuthed(false);
    window.addEventListener('qhs-admin-unauthorized', handler);
    return () => window.removeEventListener('qhs-admin-unauthorized', handler);
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-light" style={{ background: 'var(--bg)', color: 'var(--fg2)' }}>
        Verifying session…
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onAuthed={() => setAuthed(true)} />;
  }

  return (
    <AdminLayout onSignOut={() => setAuthed(false)}>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="instagram" element={<AdminInstagram />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="instant-consult" element={<AdminInstantConsult />} />
        <Route path="combined-healings" element={<AdminCombinedHealings />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

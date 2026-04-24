import React, { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, Check, AlertCircle } from 'lucide-react';
import { adminApi } from './api';
import { validateEmail, validateInstagramHandle, validatePhone, validateLocation, normalizeInstagramHandle } from './validation';

const VALIDATORS = {
  instagram_handle: (v) => validateInstagramHandle(v),
  contact_email: (v) => validateEmail(v, { required: false }),
  contact_phone: (v) => validatePhone(v),
  contact_location: (v) => validateLocation(v),
};

const FIELDS = [
  { key: 'instagram_handle', label: 'Instagram handle', placeholder: 'quantum_healingspace', help: 'Letters, numbers, dot, underscore. The "@" is added automatically.' },
  { key: 'contact_email', label: 'Contact email', type: 'email', placeholder: 'hello@example.com' },
  { key: 'contact_phone', label: 'Contact phone', placeholder: '+91 00000 00000' },
  { key: 'contact_location', label: 'Location', placeholder: 'City, Country' },
];

const TOGGLES = [
  { key: 'instagram_section_enabled', label: 'Show Instagram section on homepage' },
  { key: 'newsletter_section_enabled', label: 'Show newsletter signup in footer' },
];

export default function AdminSettings() {
  const [config, setConfig] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [touched, setTouched] = useState({});

  const fieldErrors = useMemo(() => {
    if (!config) return {};
    const out = {};
    for (const [k, fn] of Object.entries(VALIDATORS)) {
      const e = fn(config[k]);
      if (e) out[k] = e;
    }
    return out;
  }, [config]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const cfg = await adminApi.getConfig();
      setConfig(cfg);
      setOriginal(cfg);
    } catch (e) {
      setError(e.message || 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dirty = config && original && Object.keys({ ...config, ...original }).some((k) => config[k] !== original[k]);

  const save = async () => {
    if (!config) return;
    if (hasErrors) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f.key, true])));
      setError('Please fix the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const patch = {};
      for (const k of Object.keys(config)) {
        let v = config[k];
        if (k === 'instagram_handle' && typeof v === 'string') v = normalizeInstagramHandle(v);
        if (v !== original[k]) patch[k] = v;
      }
      const next = await adminApi.putConfig(patch);
      setConfig(next);
      setOriginal(next);
      setTouched({});
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3000);
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading…</div>;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>◊ Settings</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Site config</h1>
          <p className="text-sm font-light mt-2 max-w-xl" style={{ color: 'var(--fg2)' }}>
            These values are stored in Firestore and read by the public site.
          </p>
        </div>
        <button
          onClick={save}
          disabled={!dirty || saving || hasErrors}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: dirty && !hasErrors ? 'var(--accent)' : 'var(--accent-dim)', color: dirty && !hasErrors ? '#fff' : 'var(--fg2)', border: '1px solid var(--accent)' }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : savedAt ? <Check className="w-3 h-3" strokeWidth={2} /> : <Save className="w-3 h-3" strokeWidth={2} />}
          {saving ? 'Saving' : savedAt ? 'Saved' : 'Save changes'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 flex items-start gap-2" style={{ background: 'rgba(224,138,111,0.08)', border: '1px solid rgba(224,138,111,0.3)', color: '#E08A6F' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm font-light">{error}</span>
        </div>
      )}

      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h2 className="text-[10px] tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>General</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {FIELDS.map((f) => {
            const err = fieldErrors[f.key];
            const showErr = err && touched[f.key];
            return (
              <label key={f.key} className="block">
                <span className="block text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--fg2)' }}>{f.label}</span>
                <input
                  type={f.type || 'text'}
                  value={config[f.key] || ''}
                  onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
                  placeholder={f.placeholder}
                  aria-invalid={showErr ? 'true' : undefined}
                  className="w-full bg-transparent border-0 outline-none text-sm font-light placeholder:opacity-40 pb-2.5"
                  style={{ color: 'var(--fg)', borderBottom: `1px solid ${showErr ? '#E08A6F' : 'var(--border2)'}` }}
                />
                {showErr ? (
                  <p className="text-[10px] mt-1.5 font-light flex items-center gap-1" style={{ color: '#E08A6F' }}>
                    <AlertCircle className="w-2.5 h-2.5" strokeWidth={2} /> {err}
                  </p>
                ) : f.help ? (
                  <p className="text-[10px] mt-1.5 font-light" style={{ color: 'var(--fg3)' }}>{f.help}</p>
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h2 className="text-[10px] tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--fg3)' }}>Sections</h2>
        <div className="space-y-3">
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center justify-between gap-4 py-2 cursor-pointer">
              <span className="text-sm font-light" style={{ color: 'var(--fg)' }}>{t.label}</span>
              <span
                onClick={() => setConfig({ ...config, [t.key]: !config[t.key] })}
                className="relative inline-block w-10 h-5 rounded-full flex-shrink-0 transition-colors"
                style={{ background: config[t.key] ? 'var(--accent)' : 'var(--border2)' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{
                    background: '#fff',
                    transform: config[t.key] ? 'translateX(22px)' : 'translateX(2px)',
                  }}
                />
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

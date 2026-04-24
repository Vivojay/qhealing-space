import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Image as ImageIcon, Layers, RefreshCw, Save, ExternalLink, Check, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi } from './api';

const MAX_SELECT = 8;

function TypeIcon({ item }) {
  const Icon = item.type === 'video' ? Film : item.is_carousel ? Layers : ImageIcon;
  return <Icon className="w-3 h-3" strokeWidth={2} />;
}

export default function AdminInstagram() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]); // ordered list of ids
  const [originalSelected, setOriginalSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const dragId = useRef(null);

  const load = async (force = false) => {
    setError('');
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      const r = force ? await adminApi.refreshInstagram().then(() => adminApi.getInstagram(false)) : await adminApi.getInstagram(false);
      setMedia(r.data || []);
      const sel = r.selected_ids || [];
      setSelected(sel);
      setOriginalSelected(sel);
    } catch (e) {
      setError(e.message || 'Failed to load Instagram media');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dirty = useMemo(() => {
    if (selected.length !== originalSelected.length) return true;
    return selected.some((id, i) => id !== originalSelected[i]);
  }, [selected, originalSelected]);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, id];
    });
  };

  const moveSelected = (id, dir) => {
    setSelected((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const onDragStart = (id) => { dragId.current = id; };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (id) => {
    if (!dragId.current || dragId.current === id) return;
    setSelected((prev) => {
      const from = prev.indexOf(dragId.current);
      const to = prev.indexOf(id);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragId.current = null;
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await adminApi.setCuration(selected);
      setOriginalSelected(selected);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3000);
    } catch (e) {
      setError(e.message || 'Failed to save curation');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => setSelected([]);
  const useLatest = () => setSelected(media.slice(0, MAX_SELECT).map((m) => m.id));

  const selectedItems = selected
    .map((id) => media.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-3" style={{ color: 'var(--accent-text)' }}>◊ Instagram</p>
          <h1 className="hero-display text-4xl lg:text-5xl" style={{ color: 'var(--fg)' }}>Curate reels</h1>
          <p className="text-sm font-light mt-2 max-w-xl" style={{ color: 'var(--fg2)' }}>
            Pick up to {MAX_SELECT} posts to feature on the homepage. Drag to reorder. Leave empty to show the latest 8 automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase hover-accent disabled:opacity-50"
            style={{ border: '1px solid var(--border2)', color: 'var(--fg)' }}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            Refresh from Instagram
          </button>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: dirty ? 'var(--accent)' : 'var(--accent-dim)', color: dirty ? '#fff' : 'var(--fg2)', border: '1px solid var(--accent)' }}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} /> : savedAt ? <Check className="w-3 h-3" strokeWidth={2} /> : <Save className="w-3 h-3" strokeWidth={2} />}
            {saving ? 'Saving' : savedAt ? 'Saved' : 'Save selection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6 flex items-start gap-2" style={{ background: 'rgba(224,138,111,0.08)', border: '1px solid rgba(224,138,111,0.3)', color: '#E08A6F' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-sm font-light">{error}</span>
        </div>
      )}

      {/* Selected ordered preview */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] tracking-[0.28em] uppercase" style={{ color: 'var(--fg3)' }}>
            Current selection · {selected.length}/{MAX_SELECT}
          </p>
          <div className="flex gap-2">
            <button onClick={useLatest} className="text-[10px] tracking-[0.22em] uppercase px-3 py-1.5 rounded-full hover-accent" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
              Use latest 8
            </button>
            <button onClick={clearAll} disabled={!selected.length} className="text-[10px] tracking-[0.22em] uppercase px-3 py-1.5 rounded-full hover-accent disabled:opacity-40" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
              <RotateCcw className="w-3 h-3 inline mr-1.5" strokeWidth={1.8} /> Clear
            </button>
          </div>
        </div>
        {selected.length === 0 ? (
          <div className="rounded-xl px-5 py-8 text-center text-sm font-light" style={{ background: 'var(--bg2)', border: '1px dashed var(--border2)', color: 'var(--fg2)' }}>
            No selection — homepage will show the latest 8 automatically.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {selectedItems.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(item.id)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(item.id)}
                className="relative aspect-[9/12] rounded-md overflow-hidden cursor-move group"
                style={{ background: 'var(--bg2)', border: '1px solid var(--accent)' }}
                title={`Position ${i + 1} — drag to reorder`}
              >
                <img src={item.thumbnail_url || item.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[12px] leading-none"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                  title="Remove"
                >×</button>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSelected(item.id, -1)} className="text-[12px] text-white px-1" disabled={i === 0}>‹</button>
                  <button onClick={() => moveSelected(item.id, +1)} className="text-[12px] text-white px-1" disabled={i === selectedItems.length - 1}>›</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All media gallery */}
      <p className="text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>
        All recent media · {media.length}
      </p>

      {loading ? (
        <div className="text-sm font-light" style={{ color: 'var(--fg2)' }}>Loading Instagram media…</div>
      ) : media.length === 0 ? (
        <div className="rounded-xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--fg2)' }}>
          No media available. Try refreshing or check that Instagram credentials are set in Settings.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {media.map((item) => {
            const idx = selected.indexOf(item.id);
            const picked = idx >= 0;
            const disabled = !picked && selected.length >= MAX_SELECT;
            return (
              <button
                key={item.id}
                onClick={() => !disabled && toggle(item.id)}
                onDoubleClick={() => setPreviewItem(item)}
                disabled={disabled}
                className="relative aspect-[9/12] overflow-hidden rounded-md group disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg2)',
                  border: picked ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}
                title={item.caption?.slice(0, 100) || 'Instagram post'}
              >
                <img src={item.thumbnail_url || item.media_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff' }}>
                  <TypeIcon item={item} />
                </div>
                {picked && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: 'var(--accent)', color: '#fff' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity flex flex-col justify-end p-1.5">
                  <span className="text-[8px] text-white/90 line-clamp-2 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                    {item.caption ? item.caption.slice(0, 60) + (item.caption.length > 60 ? '…' : '') : 'View'}
                  </span>
                  <a href={item.permalink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[8px] text-white/80 inline-flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" strokeWidth={2} /> Open
                  </a>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80" onClick={() => setPreviewItem(null)}>
          <div className="max-w-md w-full rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)' }} onClick={(e) => e.stopPropagation()}>
            {previewItem.type === 'video' ? (
              <video src={previewItem.media_url} controls autoPlay className="w-full" />
            ) : (
              <img src={previewItem.thumbnail_url || previewItem.media_url} alt="" className="w-full" />
            )}
            <div className="p-4">
              <p className="text-xs font-light mb-3" style={{ color: 'var(--fg2)' }}>
                {previewItem.caption || 'No caption'}
              </p>
              <a href={previewItem.permalink} target="_blank" rel="noopener noreferrer" className="text-[11px] tracking-[0.22em] uppercase inline-flex items-center gap-2" style={{ color: 'var(--accent-text)' }}>
                <ExternalLink className="w-3 h-3" strokeWidth={1.8} /> Open on Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

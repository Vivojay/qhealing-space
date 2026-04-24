import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Image as ImageIcon, Layers, Instagram, ExternalLink } from 'lucide-react';

const FALLBACK_HANDLE = 'quantum_healingspace';

/* Brick-offset pattern for 8 tiles arranged in 2 columns of 4.
   Heights alternate to create the offset / staggered feel.
   Aspect-ratio is column-width : tile-height. 9/16 ≈ portrait reel,
   9/12 = a shorter reel.                                        */
const HEIGHT_PATTERN = [
  // column A (indexes 0..3)
  '9 / 16',
  '9 / 12',
  '9 / 16',
  '9 / 13',
  // column B (indexes 4..7) — offset
  '9 / 12',
  '9 / 16',
  '9 / 13',
  '9 / 16',
];

function TypeBadge({ type, isCarousel }) {
  let Icon = ImageIcon;
  if (type === 'video') Icon = Film;
  else if (isCarousel) Icon = Layers;
  return (
    <div
      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md pointer-events-none"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      aria-hidden
    >
      <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
    </div>
  );
}

function ReelTile({ item, idx }) {
  const aspect = HEIGHT_PATTERN[idx % HEIGHT_PATTERN.length];
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Try autoplay video, but iOS may block — videos are muted+inline so it should work.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
  }, [item.media_url]);

  const handle = (item.permalink || '').replace(/\/$/, '').split('/').pop();

  return (
    <motion.a
      href={item.permalink || `https://www.instagram.com/${FALLBACK_HANDLE}/`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: (idx % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative block w-full overflow-hidden group"
      style={{
        aspectRatio: aspect,
        background: 'var(--bg2)',
        border: '0',
        boxShadow: hovered
          ? '0 18px 40px -18px rgba(0,0,0,0.45)'
          : '0 6px 18px -10px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      aria-label={`Open Instagram ${item.type === 'video' ? 'reel' : 'post'} ${handle ? handle : ''} in a new tab`}
    >
      {item.type === 'video' && item.media_url ? (
        <video
          ref={videoRef}
          src={item.media_url}
          poster={item.thumbnail_url || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={item.thumbnail_url || item.media_url}
          alt={item.caption?.slice(0, 80) || 'Instagram post'}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <TypeBadge type={item.type} isCarousel={item.is_carousel} />

      {/* Bottom caption / external link hint — visible on hover */}
      <div
        className="absolute left-0 right-0 bottom-0 p-3 flex items-end justify-between gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none"
      >
        <span
          className="text-[10px] font-light leading-snug text-white/90 line-clamp-2"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
        >
          {item.caption ? item.caption.slice(0, 70) + (item.caption.length > 70 ? '…' : '') : 'View on Instagram'}
        </span>
        <ExternalLink className="w-3 h-3 text-white/90 flex-shrink-0" strokeWidth={2} />
      </div>
    </motion.a>
  );
}

function PlaceholderTile({ idx }) {
  const aspect = HEIGHT_PATTERN[idx % HEIGHT_PATTERN.length];
  return (
    <div
      className="relative w-full overflow-hidden animate-pulse"
      style={{
        aspectRatio: aspect,
        background: 'var(--bg2)',
        border: '0',
      }}
    />
  );
}

export default function InstagramReelsGrid({ handle = FALLBACK_HANDLE }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/instagram/reels?limit=12')
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.detail || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        setItems((j.data || []).slice(0, 8));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e.message || e));
      });
    return () => { cancelled = true; };
  }, []);

  // Distribute items into 2 columns: alternating index for nicer brick offset
  const tiles = items || Array.from({ length: 8 }).map((_, i) => ({ _placeholder: true, _i: i }));
  const columnA = tiles.filter((_, i) => i % 2 === 0);
  const columnB = tiles.filter((_, i) => i % 2 === 1);

  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: 'var(--bg-elev)', borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>
              ◊ Live from the studio
            </p>
            <h2 className="hero-display text-4xl lg:text-6xl" style={{ color: 'var(--fg)' }}>
              On{' '}
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, color: 'var(--accent-text)' }}>
                Instagram
              </span>
            </h2>
          </motion.div>

          <motion.a
            href={`https://www.instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] tracking-[0.22em] uppercase hover-accent"
            style={{
              border: '1px solid var(--border2)',
              color: 'var(--fg2)',
              background: 'var(--accent-dim)',
            }}
          >
            <Instagram className="w-3.5 h-3.5" strokeWidth={1.8} />
            @{handle}
          </motion.a>
        </div>

        {error ? (
          <div
            className="rounded-xl px-5 py-6 text-sm font-light"
            style={{
              border: '1px dashed var(--border2)',
              color: 'var(--fg2)',
              background: 'var(--accent-dim)',
            }}
          >
            <p className="mb-2" style={{ color: 'var(--fg)' }}>
              We couldn't load the latest Instagram reels right now.
            </p>
            <p className="text-xs" style={{ color: 'var(--fg3)' }}>
              {error}
            </p>
            <a
              href={`https://www.instagram.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.22em] uppercase hover-accent px-4 py-2 rounded-full"
              style={{ border: '1px solid var(--border2)', color: 'var(--accent-text)' }}
            >
              <Instagram className="w-3.5 h-3.5" strokeWidth={1.8} />
              View on Instagram
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 items-start">
            <div className="flex flex-col gap-0">
              {columnA.map((it, i) =>
                it._placeholder ? (
                  <PlaceholderTile key={`a-ph-${it._i}`} idx={it._i} />
                ) : (
                  <ReelTile key={it.id || `a-${i}`} item={it} idx={i * 2} />
                )
              )}
            </div>
            <div className="flex flex-col gap-0">
              {columnB.map((it, i) =>
                it._placeholder ? (
                  <PlaceholderTile key={`b-ph-${it._i}`} idx={it._i} />
                ) : (
                  <ReelTile key={it.id || `b-${i}`} item={it} idx={i * 2 + 1} />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

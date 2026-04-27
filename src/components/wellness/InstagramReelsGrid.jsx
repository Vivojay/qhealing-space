import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Image as ImageIcon, Layers, Instagram, ExternalLink } from 'lucide-react';
import { apiUrl } from '@/utils';

const FALLBACK_HANDLE = 'quantum_healingspace';
const REELS_PER_VIEW = 4;

function normalizeInstagramError(message) {
  const raw = String(message || '').trim();
  if (!raw) return 'Instagram is temporarily unavailable.';
  const lower = raw.toLowerCase();
  if (lower.includes('access token') || lower.includes('oauth')) {
    return 'Instagram is temporarily unavailable. Please try again shortly.';
  }
  if (lower.includes('http 5')) {
    return 'Instagram is temporarily unavailable. Please try again shortly.';
  }
  return raw;
}

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

function ReelTile({ item, idx, uniform = false, marquee = false }) {
  const aspect = marquee ? '9 / 16' : uniform ? '4 / 5' : HEIGHT_PATTERN[idx % HEIGHT_PATTERN.length];
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
      initial={marquee ? false : { opacity: 0, y: 24 }}
      whileInView={marquee ? undefined : { opacity: 1, y: 0 }}
      viewport={marquee ? undefined : { once: true, margin: '-60px' }}
      transition={marquee ? undefined : { duration: 0.7, delay: (idx % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={uniform ? undefined : { y: -4 }}
      className="relative block w-full overflow-hidden group"
      style={{
        width: marquee ? 'clamp(150px, 17vw, 340px)' : '100%',
        aspectRatio: aspect,
        background: 'var(--bg2)',
        border: '0',
        boxShadow: uniform
          ? 'none'
          : hovered
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

function PlaceholderTile({ idx, uniform = false, marquee = false }) {
  const aspect = marquee ? '9 / 16' : uniform ? '4 / 5' : HEIGHT_PATTERN[idx % HEIGHT_PATTERN.length];
  return (
    <div
      className="relative w-full overflow-hidden animate-pulse"
      style={{
        width: marquee ? 'clamp(150px, 17vw, 340px)' : '100%',
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
  const [activeWindow, setActiveWindow] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl('/api/instagram/reels?limit=12'))
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
        setError(normalizeInstagramError(e.message || e));
      });
    return () => { cancelled = true; };
  }, []);

  const tiles = items || Array.from({ length: 8 }).map((_, i) => ({ _placeholder: true, _i: i }));
  const windowCount = Math.max(1, tiles.length - REELS_PER_VIEW + 1);

  const scrollToWindow = useCallback((index) => {
    const el = carouselRef.current;
    if (!el) return;
    const clampedIndex = Math.max(0, Math.min(windowCount - 1, index));
    const itemWidth = el.clientWidth / REELS_PER_VIEW || 1;
    el.scrollTo({ left: clampedIndex * itemWidth, behavior: 'smooth' });
    setActiveWindow(clampedIndex);
  }, [windowCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const el = carouselRef.current;
    if (!el) return undefined;

    let raf = 0;
    const updateActiveWindow = () => {
      const itemWidth = el.clientWidth / REELS_PER_VIEW || 1;
      const nextWindow = Math.round(el.scrollLeft / itemWidth);
      const clamped = Math.max(0, Math.min(windowCount - 1, nextWindow));
      setActiveWindow((prev) => (prev === clamped ? prev : clamped));
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveWindow);
    };

    const onResize = () => updateActiveWindow();
    updateActiveWindow();

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [windowCount]);

  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: 'var(--bg-elev)', borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-6xl lg:max-w-[min(1320px,94vw)] mx-auto px-6 lg:px-8">
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
          <>
            <div
              ref={carouselRef}
              className="hide-scrollbar relative left-1/2 w-screen -translate-x-1/2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-1"
            >
              <div className="flex items-stretch gap-0 w-max min-w-full">
                {tiles.slice(0, 8).map((it, i) => {
                  const key = it._placeholder ? `row-ph-${it._i}` : (it.id || `row-${i}`);
                  return (
                    <div
                      key={key}
                      className="shrink-0 snap-start"
                      style={{ width: '25vw', flexBasis: '25vw' }}
                    >
                      {it._placeholder ? (
                        <PlaceholderTile idx={it._i} uniform />
                      ) : (
                        <ReelTile item={it} idx={i} uniform />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {windowCount > 1 && (
              <div className="mt-5 flex justify-center">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2"
                  style={{ border: '1px solid var(--border2)', background: 'var(--bg2)' }}
                >
                  {Array.from({ length: windowCount }).map((_, idx) => {
                    const active = idx === activeWindow;
                    return (
                      <button
                        key={`reel-window-${idx}`}
                        type="button"
                        onClick={() => scrollToWindow(idx)}
                        className="rounded-full transition-all duration-300"
                        aria-label={`Go to reels window ${idx + 1} of ${windowCount}`}
                        aria-current={active ? 'true' : undefined}
                        style={{
                          width: active ? '26px' : '8px',
                          height: '8px',
                          background: active ? 'var(--accent-text)' : 'var(--border2)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

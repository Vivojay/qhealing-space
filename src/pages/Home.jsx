import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Orbit, Clock3, Feather, Music, ChevronDown, ArrowUpRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useTheme } from '@/context/ThemeContext';
import Footer from '@/components/wellness/Footer';
import InstagramReelsGrid from '@/components/wellness/InstagramReelsGrid';
import textureImmo from '../assets/textures/immo-wegmann-R24Vq8RRxWU-unsplash.jpg';
import textureBernd from '../assets/textures/bernd-dittrich-MFxXebdF0mU-unsplash.jpg';
import heroMeImage from '../../attached_assets/elements/hero-me.jpg';

const HERO_VIDEO_SRC = 'https://www.pexels.com/download/video/8025555/';
const HERO_VIDEO_POSTER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2200&q=95';

const SERVICES = [
  {
    name: 'Reiki',
    bookingService: 'Reiki Healing',
    icon: Sparkles,
    desc: 'Universal life force energy channeled for deep healing and restoration of balance.',
  },
  {
    name: 'Akashic Records',
    bookingService: 'Akashic Records',
    icon: BookOpen,
    desc: 'Access the soul\'s vibrational archive — past, present, and future — to reveal hidden patterns.',
  },
  {
    name: 'Deep Chakra Healing',
    bookingService: 'Deep Chakra Healing',
    icon: Orbit,
    desc: 'Balance your 7 energy centers to transform physical, emotional, and spiritual wellbeing.',
  },
  {
    name: 'Past Life Regression',
    bookingService: 'Past Life Regression',
    icon: Clock3,
    desc: 'Uncover karmic roots behind present-day fears, patterns, and chronic conditions.',
  },
  {
    name: 'Angel Therapy',
    bookingService: 'Angel Therapy',
    icon: Feather,
    desc: 'Connect with archangels and guardian angels for guidance across all areas of life.',
  },
  {
    name: 'Sound Therapy',
    bookingService: 'Sound Therapy',
    icon: Music,
    desc: 'Tibetan bowls and tuning forks create resonance fields for cellular healing.',
  },
];

const SERVICE_BG = [
  'var(--accent-dim)',
  'var(--bg2)',
  'var(--bg)',
  'var(--bg)',
  'var(--accent-dim)',
  'var(--bg2)',
];

const TESTIMONIALS = [
  {
    quote: "After three sessions of Chakra Healing with Vartika, a 12-year chronic back pain I had been carrying simply dissolved. I didn't believe it was possible.",
    name: 'Priya Mehta',
    role: 'Architect, Delhi',
  },
  {
    quote: "The Past Life Regression session explained patterns in my relationships I had never understood. It was like seeing the code beneath the program of my life.",
    name: 'Rohit Sharma',
    role: 'Entrepreneur, Mumbai',
  },
  {
    quote: "Vartika's corporate workshop completely shifted our team's dynamic. People were calmer, more present, and — remarkably — more productive.",
    name: 'Sunita Agarwal',
    role: 'HR Director, SmartAnalyst',
  },
];

export default function Home() {
  const { isDark } = useTheme();
  const heroRef = useRef(null);
  const heroWordmarkRef = useRef(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [heroHeight, setHeroHeight] = useState(null);
  const [wordmarkEdgeInset, setWordmarkEdgeInset] = useState(24);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroMediaStyle = isDark
    ? { transform: 'scaleX(-1)' }
    : { transform: 'scaleX(-1)' }
    // : { filter: 'contrast(2) brightness(1) saturate(1.2)', transform: 'scaleX(-1)' };

  const syncHeroGeometry = useCallback(() => {
    if (typeof window === 'undefined') return;

    const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight || 0);
    const edgeInset = Math.max(24, Math.min(52, Math.round(viewportHeight * 0.05)));
    const textHeight = heroWordmarkRef.current
      ? Math.ceil(heroWordmarkRef.current.getBoundingClientRect().height)
      : 0;
    const requiredHeight = textHeight ? Math.max(viewportHeight, textHeight + edgeInset * 2) : viewportHeight;

    setWordmarkEdgeInset((prev) => (prev === edgeInset ? prev : edgeInset));
    setHeroHeight((prev) => (prev === requiredHeight ? prev : requiredHeight));
  }, []);

  useEffect(() => {
    setMounted(true);
    const onMove = (e) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * -14);
      setMouseY((e.clientY / window.innerHeight - 0.5) * -8);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let raf = 0;
    const queueSync = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(syncHeroGeometry);
    };

    queueSync();
    window.addEventListener('resize', queueSync);
    window.visualViewport?.addEventListener('resize', queueSync);
    document.fonts?.ready?.then(queueSync).catch(() => {});

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', queueSync);
      window.visualViewport?.removeEventListener('resize', queueSync);
    };
  }, [syncHeroGeometry]);

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ═══ HERO ═══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: heroHeight ? `${heroHeight}px` : '100svh' }}
      >
        {/* Background video */}
        <motion.div
          className="absolute inset-0 scale-[1.08]"
          style={{
            y: bgY,
            transform: mounted
              ? `translate(${mouseX}px, ${mouseY}px) scale(1.08)`
              : 'scale(1.08)',
            transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {heroVideoFailed ? (
            <img
              src={HERO_VIDEO_POSTER}
              alt=""
              className="w-full h-full object-cover"
              style={heroMediaStyle}
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <video
              src={HERO_VIDEO_SRC}
              poster={HERO_VIDEO_POSTER}
              className="w-full h-full object-cover"
              style={heroMediaStyle}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setHeroVideoFailed(true)}
              aria-hidden="true"
            />
          )}
        </motion.div>
        {isDark && (
          <>
            <div className="absolute inset-0" style={{ background: 'var(--hero-overlay-left)' }} />
            <div className="absolute inset-0" style={{ background: 'var(--hero-overlay-bottom)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--hero-overlay-glow)' }} />
          </>
        )}

        {/* ── QUANTUM HEALING SPACE — TRUE VERTICAL text (writing-mode) ── */}
        <div
          className="absolute right-0 overflow-hidden pointer-events-none select-none flex items-center"
          style={{ top: `${wordmarkEdgeInset}px`, bottom: `${wordmarkEdgeInset}px` }}
        >
          <motion.div
            ref={heroWordmarkRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 'clamp(3rem, 14vh, 22rem)',
              fontFamily: "'Inter Tight', 'Manrope', sans-serif",
              fontWeight: 500,
              letterSpacing: '-0.055em',
              lineHeight: 0.92,
              whiteSpace: 'nowrap',
              color: 'var(--accent-text)',
              opacity: 0.14,
            }}
          >
            <span style={{ display: 'inline-block' }}>QUANTUM</span>
            <br />
            <span style={{ display: 'inline-block', paddingTop: '2ch' }}>{'HEALING\u00A0SPACE'}</span>
          </motion.div>
        </div>

        {/* Left content */}
        <div className="absolute inset-0 flex flex-col justify-between px-8 lg:px-14 py-10 lg:py-12 pointer-events-none">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: 'var(--fg3)' }}
          >
            Est. — Gurugram, India
          </motion.p>

          <div className="max-w-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.42 }}
              className="mb-6 lg:mt-[-14vh]"
            >
              <img
                src={heroMeImage}
                alt="Portrait of Vartika Shukla"
                className="block h-28 w-auto object-cover lg:h-[clamp(268px,32vh,392px)] xl:h-[clamp(332px,34vh,468px)] 2xl:h-[clamp(384px,36vh,540px)]"
                style={{
                  border: '1px solid var(--border2)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.28)',
                  background: 'var(--bg2)',
                }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-sm font-light mb-4"
              style={{ color: 'var(--fg2)' }}
            >
              Guided by <span style={{ color: 'var(--fg)' }}>Vartika Shukla</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65 }}
              className="text-[15px] font-light leading-relaxed mb-10"
              style={{ color: 'var(--fg2)' }}
            >
              Psychic, hypnotherapist, psychologist, and <span style={{ color: 'var(--accent-text)' }}>Shaktipat guru</span> with 25+ years guiding women, men, and children through healing modalities, predictive sciences, and spiritually grounded counseling.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex gap-3 flex-wrap"
            >
              <Link
                to="/healings"
                className="px-7 py-3 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}
              >
                Explore Healings
              </Link>
              <Link
                to={`${createPageUrl('Booking')}?service=${encodeURIComponent('Other / Not sure yet')}`}
                className="px-7 py-3 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
              >
                Book a Session
              </Link>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="flex items-center gap-3"
            >
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-xs"
                style={{ color: 'var(--fg3)' }}
              >
                ↓
              </motion.span>
              <motion.p
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[10px] tracking-[0.35em] uppercase"
                style={{ color: 'var(--fg3)' }}
              >
                Scroll to explore
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Thin vertical divider */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-[40%] top-[15%] h-[70%] w-px origin-top hidden lg:block"
          style={{ background: 'var(--border)' }}
        />
      </section>

      {/* ═══ MANIFESTO ═══ */}
      <section className="relative py-28 lg:py-40 overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${textureImmo})`,
            backgroundSize: '520px auto',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            opacity: 0.2,
            mixBlendMode: 'soft-light',
          }}
          aria-hidden
        />

        {/* Decorative frame with curved bezier left edge */}
        <svg
          className="absolute top-16 left-[10%] w-[70%] h-[70%] pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M11 1 C3 11 2 24 10 33 C18 43 18 56 9 66 C1 76 3 90 11 99 L99 99 L99 1 Z"
            fill="none"
            stroke="var(--border)"
            strokeWidth="0.9"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M13 7 C8 18 7 28 12 36 C17 44 17 56 12 64 C7 73 8 84 13 93"
            fill="none"
            stroke="var(--accent-soft)"
            strokeWidth="0.75"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="max-w-5xl mx-auto px-8 lg:px-16 relative">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] tracking-[0.45em] uppercase mb-10"
            style={{ color: 'var(--fg3)' }}
          >
            Our Philosophy
          </motion.p>

          {/* Quote block — standalone, no overlap */}
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl lg:text-5xl leading-tight mb-16"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: 'var(--fg)',
              fontWeight: 300,
            }}
          >
            All conditions are treatable through{' '}
            <span style={{ color: 'var(--accent-text)' }}>spiritual healing</span>
            {' '}— though not all people are{' '}
            <em style={{ color: 'var(--fg2)' }}>equally receptive.</em>
          </motion.blockquote>

          {/* Tenets list · long copy revealed on hover/focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="peek pt-10"
            style={{ borderTop: '1px solid var(--border)' }}
            tabIndex={0}
          >
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Faith opens the channel',
                'Improvement is the rule',
                'Results compound with time',
                'Receptivity deepens',
                'Pathways realign',
                'Beyond the conventional',
              ].map((b, i) => (
                <li
                  key={b}
                  className="philosophy-row group flex items-center gap-3 rounded-lg pl-3 pr-3 py-2.5 hover-accent"
                  style={{
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    background: 'var(--accent-dim)',
                  }}
                >
                  <span
                    className="philosophy-row-num font-mono text-[10px] tabular-nums tracking-[0.18em]"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="philosophy-row-rule h-px flex-shrink-0"
                    style={{ width: 18, background: 'var(--accent)', opacity: 0.55 }}
                  />
                  <span className="font-light text-[13.5px] flex-1">{b}</span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                    style={{ color: 'var(--accent-text)' }}
                    strokeWidth={1.8}
                  />
                </li>
              ))}
            </ul>
            <div className="peek-content">
              <div className="grid lg:grid-cols-2 gap-12">
                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  Healing works best when approached with <span style={{ color: 'var(--accent-text)' }}>faith and openness</span>. Results vary, yet it is extremely rare for someone to receive healing and experience no improvement.
                </p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  Spiritual healing helps in multiple ways — related issues get resolved, better pathways appear, and the person becomes <span style={{ color: 'var(--accent-text)' }}>more positive and receptive</span> to life itself.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div
                className="peek-hint peek-hint-explicit inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  border: '1px solid var(--accent-soft)',
                  background: 'var(--accent-dim)',
                  color: 'var(--accent-text)',
                  opacity: 1,
                }}
              >
                <span className="dot" />
                <span className="peek-label">Read the philosophy</span>
                <ChevronDown
                  className="peek-chevron w-3 h-3"
                  strokeWidth={2}
                />
              </div>
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'var(--fg3)' }}>
                — Vartika Shukla
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SERVICES PREVIEW ═══ */}
      <section className="section-accent py-28 lg:py-40 relative overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        {/* decorative bg image */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <img src="https://images.unsplash.com/photo-1620121684840-edffcfc4b878?w=1800&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, var(--accent-dim), transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-16">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] tracking-[0.45em] uppercase mb-4"
                style={{ color: 'var(--accent-text)' }}
              >
                ◊ Healing Modalities
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="text-5xl lg:text-7xl hero-display"
                style={{ color: 'var(--fg)' }}
              >
                20+ Pathways<br />
                <span style={{ color: 'var(--accent-text)', fontWeight: 300, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.02em' }}>to wholeness</span>
              </motion.h2>
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Link
                to="/healings"
                className="text-xs tracking-widest uppercase pb-1 hover:opacity-60 transition-opacity hidden lg:block"
                style={{ color: 'var(--fg2)', borderBottom: '1px solid var(--border2)' }}
              >
                View All Services →
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="peek p-10 lg:p-14 group cursor-pointer min-h-[280px] flex flex-col justify-between hover-surface-strong"
                  style={{ background: SERVICE_BG[i], transition: 'background-color 0.2s ease, transform 0.2s ease' }}
                  whileHover={{ y: -4 }}
                  tabIndex={0}
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-6"
                    style={{
                      border: '1px solid var(--border2)',
                      background: i % 3 === 0 ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: i % 3 === 0 ? 'var(--accent)' : 'var(--fg3)' }}
                      strokeWidth={1.8}
                    />
                  </span>
                  <div>
                    <h3
                      className="hero-display text-3xl lg:text-4xl"
                      style={{ color: 'var(--fg)' }}
                    >
                      {s.name}
                    </h3>
                    <div className="peek-content">
                      <p className="text-[13px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <div className="peek-hint"><span className="dot" /> Read</div>
                    <Link
                      to={`${createPageUrl('Booking')}?service=${encodeURIComponent(s.bookingService)}`}
                      className="text-[10px] tracking-widest uppercase hover-accent inline-block"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      Book →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 lg:hidden">
            <Link
              to="/healings"
              className="text-xs tracking-widest uppercase pb-1"
              style={{ color: 'var(--fg2)', borderBottom: '1px solid var(--border2)' }}
            >
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ MOOD GALLERY — varied images, masks, sizes ═══ */}
      <section className="relative py-24 lg:py-36 overflow-hidden" style={{ background: 'var(--bg-elev)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-12 gap-6 mb-16 items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <p className="text-[10px] tracking-[0.45em] uppercase mb-5" style={{ color: 'var(--accent-text)' }}>◊ The Practice</p>
              <h2 className="hero-display text-5xl lg:text-7xl" style={{ color: 'var(--fg)' }}>
                Sacred space,<br />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--accent-text)' }}>everyday ritual.</span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-5 text-sm font-light leading-relaxed lg:pb-3"
              style={{ color: 'var(--fg2)' }}
            >
              A discipline of <span style={{ color: 'var(--accent-text)' }}>becoming</span> — repeated until it becomes the ground beneath your feet.
            </motion.p>
          </div>

          <div className="grid grid-cols-12 gap-3 lg:gap-4">
            {/* Tall portrait — left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }}
              className="col-span-6 lg:col-span-3 row-span-2 mask-tall overflow-hidden hover-lift"
              style={{ aspectRatio: '3/5' }}
            >
              <img src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=85" alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* Wide top */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.22,1,0.36,1] }}
              className="col-span-6 lg:col-span-6 mask-soft overflow-hidden hover-lift"
              style={{ aspectRatio: '16/9' }}
            >
              <img src="https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1400&q=85" alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* Circular mask — accent tinted */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.16, ease: [0.22,1,0.36,1] }}
              className="col-span-6 lg:col-span-3 mask-pill overflow-hidden hover-lift relative"
              style={{ aspectRatio: '1/1' }}
            >
              <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=85" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'var(--accent-soft)', mixBlendMode: 'multiply' }} />
            </motion.div>

            {/* Caption strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-6 lg:col-span-3 flex flex-col justify-between p-6"
              style={{ background: 'var(--bg2)', borderRadius: '14px' }}
            >
              <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--fg3)' }}>003 / Practice</p>
              <div>
                <p className="hero-display text-3xl mb-3" style={{ color: 'var(--fg)' }}>20+</p>
                <p className="text-xs font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>healing modalities, drawn from traditions across continents.</p>
              </div>
            </motion.div>

            {/* Wide image bottom-right */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.24, ease: [0.22,1,0.36,1] }}
              className="col-span-12 lg:col-span-6 mask-soft overflow-hidden hover-lift"
              style={{ aspectRatio: '16/9' }}
            >
              <img src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=1400&q=85" alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* Arch mask */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.32, ease: [0.22,1,0.36,1] }}
              className="col-span-6 lg:col-span-3 mask-arch overflow-hidden hover-lift"
              style={{ aspectRatio: '3/4' }}
            >
              <img src="https://images.unsplash.com/photo-1604881991720-f91add269bed?w=900&q=85" alt="" className="w-full h-full object-cover" />
            </motion.div>

            {/* Blob mask */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22,1,0.36,1] }}
              className="col-span-6 lg:col-span-3 mask-blob overflow-hidden hover-lift"
              style={{ aspectRatio: '1/1' }}
            >
              <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=85" alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          {/* Marquee-style stat row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-12"
            style={{ background: 'var(--border)' }}
          >
            {[
              ['12+', 'Years of Practice'],
              ['2K+', 'Sessions Held'],
              ['20+', 'Modalities'],
              ['∞', 'Possibilities'],
            ].map(([num, label]) => (
              <div key={label} className="p-8 hover-surface" style={{ background: 'var(--bg-elev)' }}>
                <p className="hero-display text-5xl lg:text-6xl mb-2" style={{ color: 'var(--accent-text)' }}>{num}</p>
                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--fg3)' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ INSTAGRAM REELS ═══ */}
      <InstagramReelsGrid handle="quantum_healingspace" />

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-accent section-accent-2 py-28 lg:py-40 relative overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <img src="https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=1800&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>Voices</p>
            <h2 className="text-5xl lg:text-7xl hero-display" style={{ color: 'var(--fg)' }}>
              Transformed <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--accent-text)' }}>lives.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 lg:p-10"
                style={{ background: i === 1 ? 'var(--accent-dim)' : 'var(--bg)' }}
              >
                <div
                  className="text-6xl leading-none mb-5"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--accent)', lineHeight: 1 }}
                >
                  "
                </div>
                {/* Quote — serif is appropriate for testimonial quotes */}
                <p
                  className="text-[15px] font-light leading-relaxed mb-8"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--fg)', fontStyle: 'italic' }}
                >
                  {t.quote}
                </p>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <p className="text-sm font-light" style={{ color: 'var(--fg)' }}>{t.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--fg3)' }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${textureBernd})`,
            backgroundSize: '600px auto',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            opacity: 0.17,
            mixBlendMode: 'soft-light',
          }}
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[10px] tracking-[0.45em] uppercase mb-6" style={{ color: 'var(--fg3)' }}>
              Begin Your Journey
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-5xl lg:text-7xl hero-display max-w-2xl"
              style={{ color: 'var(--fg)' }}
            >
              Ready to go deeper
              <br /><span style={{ color: 'var(--accent-text)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.02em' }}>into yourself?</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to={`${createPageUrl('Booking')}?service=${encodeURIComponent('Other / Not sure yet')}`}
              className="px-8 py-4 text-xs tracking-widest uppercase text-center transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Book a Session
            </Link>
            <a
              href="https://www.instagram.com/quantum_healingspace"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-xs tracking-widest uppercase text-center transition-opacity hover:opacity-70"
              style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
            >
              Follow on Instagram
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

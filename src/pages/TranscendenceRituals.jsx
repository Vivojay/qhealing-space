import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';

const SMOOTH = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

const phases = [
  {
    number: '01',
    phase: 'Purification',
    title: 'The Clearing',
    description: 'Before ascent comes the release. Through fasting, water ceremonies, and vibrational sound, we prepare the vessel — dissolving the accumulated residue of ordinary consciousness.',
    duration: '3 Days',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=90',
  },
  {
    number: '02',
    phase: 'Dissolution',
    title: 'The Surrender',
    description: 'The ego\'s architecture begins to soften. Holotropic breathwork, guided inner journeys, and darkness retreats facilitate the sacred dissolution of the ordinary self.',
    duration: '5 Days',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=90',
  },
  {
    number: '03',
    phase: 'Immersion',
    title: 'The Depth',
    description: 'Deep immersion in non-ordinary states facilitated by plant teachers, sensory deprivation, and continuous ceremonial container held by experienced guides.',
    duration: '7 Days',
    image: 'https://images.unsplash.com/photo-1502810365585-56ffa361fdde?w=900&q=90',
  },
  {
    number: '04',
    phase: 'Integration',
    title: 'The Return',
    description: 'The most critical phase. Embodying the transcendent within daily life through somatic practices, community sharing, and extended one-to-one integration sessions.',
    duration: '14 Days',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=90',
  },
];

/* Minimal transcendence mandala motif */
function Mandala({ size = 320, reverse = false, color = 'var(--accent)' }) {
  const cx = 100;
  const cy = 100;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={reverse ? 'mandala-rotate-rev' : 'mandala-rotate'}
      style={{ opacity: 0.16 }}
      aria-hidden="true"
    >
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <g strokeWidth="0.9" opacity="0.9">
          {[90, 62, 34].map((r) => (
            <circle key={`ring-${r}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>

        <g strokeWidth="0.75" opacity="0.62">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy - 90}
              x2={cx}
              y2={cy - 34}
              transform={`rotate(${i * 45} ${cx} ${cy})`}
            />
          ))}
        </g>

        <g strokeWidth="1.2" opacity="0.7">
          <path d="M100 10 A90 90 0 0 1 190 100" />
          <path d="M100 190 A90 90 0 0 1 10 100" />
        </g>

        <g strokeWidth="1" opacity="0.78">
          <circle cx={cx} cy={cy} r="9" />
        </g>
      </g>
    </svg>
  );
}

export default function TranscendenceRituals() {
  const heroRef = useRef(null);
  const [activePhase, setActivePhase] = useState(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const currentPhase = phases[activePhase];
  const phaseCheckoutUrl = `/retreats/spiritual-healing-retreat/book?source=transcendence&phase=${encodeURIComponent(currentPhase.phase)}&stage=${encodeURIComponent(currentPhase.title)}`;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--fg)' }}>

      {/* ── HERO ── (overlay text stays white over dark image) */}
      <div ref={heroRef} className="relative h-[78vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1800&q=90" alt="Transcendence" className="w-full h-full object-cover opacity-60" />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,10,9,0.35), var(--bg))' }} />

        {/* Mandala in hero corner */}
        <div className="absolute -right-32 -top-20 pointer-events-none">
          <Mandala size={520} color="#fff" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs tracking-[0.5em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            ◊ Advanced Practice
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-display text-6xl lg:text-8xl text-white tracking-tight leading-none mb-6"
          >
            Transcendence
            <br />
            <span className="italic" style={{ color: '#d4a574' }}>Rituals</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-light max-w-lg text-[15px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            A complete four-phase journey beyond the boundaries of the conditioned self
          </motion.p>
        </div>
      </div>

      {/* ── PHASES SECTION ── (fully theme-token-driven) */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24">
        {/* Faded backdrop numeral */}
        <div
          className="absolute -left-8 lg:left-4 top-12 hero-display select-none pointer-events-none"
          style={{ fontSize: '13rem', lineHeight: 1, color: 'var(--fg)', opacity: 0.04, fontWeight: 300 }}
        >
          0{activePhase + 1}
        </div>

        <div className="relative grid lg:grid-cols-5 gap-12 lg:gap-0">
          {/* Phase selector */}
          <div className="lg:col-span-2 lg:pr-16 lg:border-r" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs tracking-[0.4em] uppercase mb-10" style={{ color: 'var(--accent-text)' }}>
              ◊ The Journey
            </p>
            <div className="space-y-2">
              {phases.map((phase, i) => {
                const active = activePhase === i;
                return (
                  <button key={phase.number} onClick={() => setActivePhase(i)} className="w-full text-left group">
                    <motion.div
                      className="flex items-center gap-6 py-5 transition-colors duration-300"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      whileHover={{ x: 4 }}
                      transition={SMOOTH}
                    >
                      <span
                        className="text-xs font-mono transition-colors duration-300"
                        style={{ color: active ? 'var(--accent-text)' : 'var(--fg3)' }}
                      >
                        {phase.number}
                      </span>
                      <div>
                        <p
                          className="text-[10px] tracking-[0.3em] uppercase mb-1 transition-colors duration-300"
                          style={{ color: active ? 'var(--accent-text)' : 'var(--fg3)' }}
                        >
                          {phase.phase}
                        </p>
                        <p
                          className="text-lg font-light transition-colors duration-300"
                          style={{ color: active ? 'var(--fg)' : 'var(--fg2)' }}
                        >
                          {phase.title}
                        </p>
                      </div>
                      <span
                        className="ml-auto text-xs transition-colors duration-300"
                        style={{ color: active ? 'var(--fg2)' : 'var(--fg3)' }}
                      >
                        {phase.duration}
                      </span>
                    </motion.div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase content */}
          <div className="lg:col-span-3 lg:pl-16 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={SMOOTH}
              >
                <div className="aspect-[16/10] overflow-hidden mb-10 rounded-sm relative">
                  <img
                    src={currentPhase.image}
                    alt={currentPhase.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--accent-soft), transparent 60%)' }} />
                </div>
                <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>
                  {currentPhase.phase}
                </p>
                <h2 className="hero-display text-4xl mb-6" style={{ color: 'var(--fg)' }}>
                  {currentPhase.title}
                </h2>
                <p className="font-light leading-relaxed text-[15px] max-w-lg" style={{ color: 'var(--fg2)' }}>
                  {currentPhase.description}
                </p>
                <Link
                  to={phaseCheckoutUrl}
                  className="mt-10 inline-flex items-center gap-2 text-sm tracking-widest uppercase transition-colors duration-300 expand-link"
                >
                  Continue to Retreat Checkout →
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── CLOSING — mandala motif ── */}
      <div className="relative py-32 overflow-hidden text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Mandala size={460} color="var(--accent)" />
          <div className="absolute"><Mandala size={300} reverse color="var(--fg2)" /></div>
        </div>
        <div className="relative max-w-2xl mx-auto px-6">
          <p className="text-[10px] tracking-[0.5em] uppercase mb-6" style={{ color: 'var(--accent-text)' }}>
            ◊ Neti Neti
          </p>
          <p className="hero-display text-3xl lg:text-5xl italic" style={{ color: 'var(--fg)' }}>
            Not this, not that.
          </p>
          <p className="mt-6 text-[13px] font-light" style={{ color: 'var(--fg2)' }}>
            What remains when all that is not-Self is removed — that is what we walk toward.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

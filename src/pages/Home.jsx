import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Footer from '@/components/wellness/Footer';

const SERVICES = [
  { name: 'Reiki', desc: 'Universal life force energy channeled for deep healing and restoration of balance.' },
  { name: 'Akashic Records', desc: 'Access the soul\'s vibrational archive — past, present, and future — to reveal hidden patterns.' },
  { name: 'Deep Chakra Healing', desc: 'Balance your 7 energy centers to transform physical, emotional, and spiritual wellbeing.' },
  { name: 'Past Life Regression', desc: 'Uncover karmic roots behind present-day fears, patterns, and chronic conditions.' },
  { name: 'Angel Therapy', desc: 'Connect with archangels and guardian angels for guidance across all areas of life.' },
  { name: 'Sound Therapy', desc: 'Tibetan bowls and tuning forks create resonance fields for cellular healing.' },
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
  const heroRef = useRef(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    setMounted(true);
    const onMove = (e) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * -14);
      setMouseY((e.clientY / window.innerHeight - 0.5) * -8);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background image */}
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
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2200&q=95"
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--bg) 28%, rgba(12,10,9,0.65) 55%, rgba(12,10,9,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 30%)' }} />

        {/* ── QUANTUM HEALING SPACE — TRUE VERTICAL text (writing-mode) ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 'clamp(3rem, 13.5vh, 22rem)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'rgba(250,250,249,0.065)',
              WebkitTextStroke: '1.5px rgba(250,250,249,0.11)',
            }}
          >
            QUANTUM HEALING SPACE
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
              Ancient wisdom, sacred ritual, and <span style={{ color: 'var(--accent-text)' }}>transformative practice</span> — converging for your healing.
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
                to="/booking"
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
        {/* Decorative offset rectangle — purely decorative, behind all content */}
        <div
          className="absolute top-16 left-[10%] w-[70%] h-[70%] pointer-events-none"
          style={{ border: '1px solid var(--border)' }}
          aria-hidden
        />

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

          {/* Body text — clearly below quote, no overlap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-12"
            style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}
          >
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
              Healing works best when approached with <span style={{ color: 'var(--accent-text)' }}>faith and openness</span>. Results vary, yet it is extremely rare for someone to receive healing and experience no improvement. Many feel profound shifts even where conventional treatments could not reach.
            </p>
            <div className="flex flex-col justify-between gap-6">
              <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                Spiritual healing helps in multiple ways — related issues get resolved, better pathways appear, and the person becomes <span style={{ color: 'var(--accent-text)' }}>more positive and receptive</span> to life itself.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-px w-8" style={{ background: 'var(--border2)' }} />
                <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'var(--fg3)' }}>
                  — Vartika Shukla
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SERVICES PREVIEW ═══ */}
      <section className="py-24 lg:py-36" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-end justify-between mb-16">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] tracking-[0.45em] uppercase mb-4"
                style={{ color: 'var(--fg3)' }}
              >
                Healing Modalities
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="text-4xl lg:text-5xl"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--fg)' }}
              >
                20+ Pathways
                <br /><em style={{ color: 'var(--accent-text)', fontStyle: 'italic' }}>to Wholeness</em>
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
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="p-8 lg:p-10 group transition-colors duration-500"
                style={{ background: SERVICE_BG[i] }}
                whileHover={{ backgroundColor: 'var(--accent-soft)' }}
              >
                <span className="text-[10px] font-mono mb-5 block" style={{ color: i % 3 === 0 ? 'var(--accent)' : 'var(--fg3)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className="text-xl mb-4"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, color: 'var(--fg)' }}
                >
                  {s.name}
                </h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {s.desc}
                </p>
                <motion.div
                  className="mt-6 h-px origin-left"
                  style={{ background: i % 2 === 0 ? 'var(--accent-soft)' : 'var(--border2)' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.06 }}
                />
                <Link
                  to="/booking"
                  className="inline-block mt-5 text-[10px] tracking-widest uppercase hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Book →
                </Link>
              </motion.div>
            ))}
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

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 lg:py-36" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: 'var(--fg3)' }}>Voices</p>
            <h2 className="text-4xl lg:text-5xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--fg)' }}>
              Transformed Lives
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
              className="text-4xl lg:text-5xl font-light leading-tight max-w-lg"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--fg)' }}
            >
              Ready to go deeper
              <br /><em style={{ color: 'var(--accent-text)' }}>into yourself?</em>
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
              to="/booking"
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

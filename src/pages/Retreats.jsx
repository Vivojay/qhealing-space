import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';

const RETREATS = [
  {
    name: 'Stress Busting Retreat',
    duration: '3 — 5 Days',
    desc: 'An invitation to re-establish yourself as an empty vessel — devoid of stress, mental confusion, and accumulated burdens. This retreat is designed to feel like a holiday: nourishing meals, restorative massage, deep sleep — with transformative educational depth as an added gift.',
    highlights: ['Therapeutic massage', 'Fresh nourishing meals', 'Deep relaxation practices', 'Inner work sessions'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=90',
  },
  {
    name: 'Silent Meditation & Yoga',
    duration: '5 — 7 Days',
    desc: 'An opportunity to re-connect with your own deeper self through the power of silence and intentional inner work. Natural settings, vegan meals, and guided silence create the conditions for profound self-inquiry. As the ancient wisdom holds: through silence, one is able to achieve one\'s deepest desire.',
    highlights: ['Complete silence practice', 'Daily meditation', 'Vegan cuisine', 'Nature immersion', 'Yoga asana', 'Prayer ceremonies'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90',
  },
  {
    name: 'Chakra Balancing Retreat',
    duration: '4 — 6 Days',
    desc: 'A healing immersion that invites you to take a closer look at your own energy centers. You will balance multiple emotional and physical issues while experiencing the deep pleasure of nature, healing massage, and fresh air — each bringing profound benefits to physical and spiritual health.',
    highlights: ['7-chakra healing sessions', 'Connecting with nature', 'Healing massage', 'Energy assessments', 'Daily balancing rituals'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=90',
  },
  {
    name: 'Spiritual Healing Retreat',
    duration: '5 — 7 Days',
    desc: 'Through daily meditations and group exercises, this retreat invites a deeper dive into the body\'s intelligence and a connection to your inner intuitive self. A time of release, relaxation and pleasure — with profound educational depth as each layer of conditioning gently dissolves.',
    highlights: ['Daily group meditations', 'Spiritual group exercises', 'Individual healing sessions', 'Intuition development'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90',
  },
  {
    name: 'Reiki Healing Retreat',
    duration: '4 — 5 Days',
    desc: 'Through the mindful use of Reiki symbols combined with healing energy, this retreat brings health to your physical, emotional, and spiritual bodies — creating an energetic foundation for balance and alignment with your most authentic self.',
    highlights: ['Daily Reiki sessions', 'Symbol activations', 'Self-healing techniques', 'Attunements available', 'Group healing circles'],
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=90',
  },
  {
    name: 'Forgiveness Retreat',
    duration: '3 — 4 Days',
    desc: 'An invitation to forgive people, situations — and most importantly, yourself. Through the practice of forgiveness you will bring awareness to your physical, emotional, and spiritual bodies. Strip away habitual patterns, behavioral stories, and the accumulated weight of resentment.',
    highlights: ['Ho\'oponopono practice', 'Inner child work', 'Somatic release', 'Group sharing circles', 'Personal ceremony'],
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90',
  },
];

function RetreatCard({ r, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8 }}
      className={`peek relative overflow-hidden ${open ? 'is-open' : ''}`}
      style={{ borderBottom: '1px solid var(--border)' }}
      tabIndex={0}
    >
      {/* Full-bleed image */}
      <div className="relative h-[55vh] lg:h-[70vh] overflow-hidden">
        <motion.img
          src={r.image}
          alt={r.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }} />

        {/* Top label */}
        <div className="absolute top-8 left-10 flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/50">{String(i + 1).padStart(2, '0')}</span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">{r.duration}</span>
        </div>

        {/* Headline overlaid on image */}
        <div className="absolute bottom-10 left-10 right-10 lg:bottom-14 lg:left-16 lg:right-16">
          <h2 className="hero-display text-5xl lg:text-7xl text-white max-w-3xl">
            {r.name}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-10 lg:px-16 py-16 lg:py-20" style={{ background: 'var(--bg)' }}>
        <div className="lg:grid lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Bullets — always visible, short */}
          <div className="lg:col-span-3">
            <p className="text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: 'var(--accent-text)' }}>
              ◊ Includes
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {r.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  <span className="text-sm font-light" style={{ color: 'var(--fg)' }}>{h}</span>
                </li>
              ))}
            </ul>

            {/* Long description — hidden by default */}
            <div className="peek-content">
              <p className="text-[15px] font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                {r.desc}
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className="peek-hint mt-8"
              type="button"
            >
              <span className="dot" />
              {open ? 'Less' : 'About this retreat'}
            </button>
          </div>

          <div className="lg:col-span-2 mt-12 lg:mt-0 flex flex-col justify-end">
            <Link
              to="/booking"
              className="inline-flex items-center justify-between gap-4 px-8 py-5 hover-accent group"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}
            >
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: 'var(--fg)' }}>Enquire</span>
              <span className="text-lg" style={{ color: 'var(--accent-text)' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Retreats() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div ref={heroRef} className="relative h-[60vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=90"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0a09 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 p-10 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ color: 'rgba(250,250,249,0.35)' }}
          >
            Immersive Journeys
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fafaf9' }}
          >
            Retreats
          </motion.h1>
        </div>
      </div>

      <div>
        {RETREATS.map((r, i) => <RetreatCard key={r.name} r={r} i={i} />)}
      </div>

      <Footer />
    </div>
  );
}

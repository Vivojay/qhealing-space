import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';

const HEALINGS = [
  {
    name: 'Reiki',
    tag: 'Energy Medicine',
    desc: 'A Japanese technique channeling universal life force energy through the practitioner\'s hands. Reiki dissolves energetic blockages, promotes deep relaxation, and activates the body\'s innate healing intelligence.',
    duration: '60 — 90 min',
    image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=900&q=90',
  },
  {
    name: 'Deep Chakra Healing',
    tag: 'Energy Centers',
    desc: 'Each of your 7 chakras corresponds to specific organs, nerve plexuses, and emotional states. Deep Chakra Healing identifies imbalances and sends targeted healing energy to restore optimal flow — creating dramatic shifts in physical, mental, and spiritual wellbeing.',
    duration: '75 min',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=90',
  },
  {
    name: 'Akashic Records',
    tag: 'Soul Archive',
    desc: 'The Akashic Records are the vibrational archive of every thought, event, action, and intention — across all time. Accessing your records reveals deep karmic patterns, hidden wisdom, and the soul-level purpose behind your current life circumstances.',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=90',
  },
  {
    name: 'Past Life Regression',
    tag: 'Hypnosis',
    desc: 'Using hypnosis to access memories from previous incarnations, PLR uncovers the karmic roots of present-day relationship patterns, unexplained fears, phobias, and chronic illnesses — bringing profound resolution and healing.',
    duration: '90 min',
    image: 'https://images.unsplash.com/photo-1502810365585-56ffa361fdde?w=900&q=90',
  },
  {
    name: 'Angel Therapy',
    tag: 'Divine Guidance',
    desc: 'Working with archangels and your personal guardian angels, this modality provides guidance across health, career, finances, relationships, and life purpose. Angels want your highest good — and will help you take the right decisions.',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=90',
  },
  {
    name: 'Ancestral Healing',
    tag: 'Lineage Work',
    desc: 'Many diseases and life patterns are directly attributable to ancestral wounds — carried invisibly through generations. Ancestral healing allows you to access your lineage, clear inherited burdens, and reclaim a disease-free, purposeful life.',
    duration: '75 min',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=90',
  },
  {
    name: 'Emotional Freedom Technique',
    tag: 'EFT · Tapping',
    desc: 'EFT taps the energy meridians located throughout the body, releasing blockages that manifest as emotional pain or physical disease. Matrix Reimprinting — its advanced form — rewrites traumatic memories at the subconscious level.',
    duration: '45 — 60 min',
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=900&q=90',
  },
  {
    name: 'Sound Therapy',
    tag: 'Vibrational Healing',
    desc: 'Tibetan singing bowls, gongs, and tuning forks create cascading resonance fields that align your vibrational frequency with states of deep cellular restoration. Certain vibrations have a profoundly rejuvenating impact on mind, body, and soul.',
    duration: '45 — 75 min',
    image: 'https://images.unsplash.com/photo-1514025538096-5898bc23b3c3?w=900&q=90',
  },
  {
    name: 'Inner Child Healing',
    tag: 'Trauma Release',
    desc: 'Your Inner Child stores all traumatic childhood memories and their ongoing impact. Everything absorbed before language — sounds, stress hormones, family dynamics — shapes your adult patterns. Inner Child work heals these at the root.',
    duration: '75 — 90 min',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=90',
  },
  {
    name: 'Hypnosis',
    tag: 'Altered States',
    desc: 'A trance-like state of heightened focus that bypasses the conscious mind\'s resistance. Hypnotherapy helps overcome addictions, manage anxiety and pain, and release deep-seated behavioral patterns with extraordinary efficacy.',
    duration: '60 — 90 min',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=90',
  },
  {
    name: 'Aura Reading & Clearing',
    tag: 'Energy Body',
    desc: 'Every living being has an ovoid energy body called the aura. Constant stress or negative emotion damages the aura, causing energy leakage and chronic fatigue. Aura assessment, clearing, and protection restore your energetic wholeness.',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=90',
  },
  {
    name: 'Ho\'oponopono',
    tag: 'Forgiveness',
    desc: 'A Hawaiian practice of reconciliation and forgiveness — simple, powerful, and universal. Ho\'oponopono heals the heart, dissolves anger and bitterness, and fills you with the healing frequencies of love and gratitude.',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=90',
  },
];

function HealingRow({ h, i }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group grid lg:grid-cols-5 gap-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Image */}
      <div className={`relative overflow-hidden lg:col-span-2 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[200px]">
          <motion.img
            src={h.image}
            alt={h.name}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className={`lg:col-span-3 flex flex-col justify-center px-8 lg:px-14 py-12 ${i % 2 === 1 ? 'lg:order-1' : ''}`}
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[10px] font-mono" style={{ color: 'var(--fg3)' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--fg3)' }}>
            {h.tag}
          </span>
        </div>
        <h2
          className="text-3xl lg:text-4xl mb-5 leading-tight"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--fg)' }}
        >
          {h.name}
        </h2>
        <p className="text-sm font-light leading-relaxed mb-8" style={{ color: 'var(--fg2)' }}>
          {h.desc}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-px w-6" style={{ background: 'var(--border2)' }} />
            <span className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--fg3)' }}>
              {h.duration}
            </span>
          </div>
          <motion.a
            href="mailto:vartikashukla@xyz.com"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.25 }}
            className="text-xs tracking-widest uppercase pb-1 hover:opacity-60 transition-opacity"
            style={{ color: 'var(--fg2)', borderBottom: '1px solid var(--border2)' }}
          >
            Book →
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Healings() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div ref={heroRef} className="relative h-[55vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1800&q=90"
            alt=""
            className="w-full h-full object-cover opacity-35"
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
            Energy Medicine
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fafaf9' }}
          >
            Healings
          </motion.h1>
        </div>
      </div>

      {/* Services list */}
      <div>
        {HEALINGS.map((h, i) => <HealingRow key={h.name} h={h} i={i} />)}
      </div>

      {/* More services note */}
      <div className="px-8 lg:px-16 py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-sm font-light mb-2" style={{ color: 'var(--fg2)' }}>
          + Many more healing modalities available as customised solutions
        </p>
        <p className="text-xs" style={{ color: 'var(--fg3)' }}>
          Including: Color Therapy · Switch Words · Dowsing · Cellular Memory Release · Meridian Clearing · Womb Healing · Zibu Symbols · Tarot · Automatic Writing · and more.
        </p>
        <a
          href="mailto:vartikashukla@xyz.com"
          className="inline-block mt-8 text-xs tracking-widest uppercase pb-1 hover:opacity-60 transition-opacity"
          style={{ color: 'var(--fg2)', borderBottom: '1px solid var(--border2)' }}
        >
          Enquire for personalised guidance →
        </a>
      </div>

      <Footer />
    </div>
  );
}

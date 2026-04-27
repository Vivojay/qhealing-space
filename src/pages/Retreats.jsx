import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import Footer from '@/components/wellness/Footer';
import { useTheme } from '@/context/ThemeContext';
import { RETREATS } from '@/constants/retreats';
import elementTiagoWolf from '../../attached_assets/elements/tiago-wolf-W4CTDtL2LQo-unsplash.jpg';
import texturePawelSlate from '../../attached_assets/textures/pawel-czerwinski-edxkIZwKvJk-unsplash.jpg';
import texturePawelCharcoal from '../../attached_assets/textures/pawel-czerwinski-Y4rs8BpjCm4-unsplash.jpg';
import textureMaxim from '../../attached_assets/textures/maxim-berg-ANuuRuCRRAc-unsplash.jpg';
import textureResource from '../../attached_assets/textures/resource-database-gRZWo4Km1A8-unsplash.jpg';
import textureVadym from '../../attached_assets/textures/vadym-alyekseyenko-0ARnshcVqfc-unsplash.jpg';
import textureImmo from '../../attached_assets/textures/immo-wegmann-R24Vq8RRxWU-unsplash.jpg';

const SMOOTH = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };
const RETREAT_SECTION_BACKGROUNDS = [
  elementTiagoWolf,
  texturePawelSlate,
  texturePawelCharcoal,
  textureMaxim,
  textureResource,
  textureVadym,
  textureImmo,
];

function RetreatRow({ r, i }) {
  const reversed = i % 2 === 1;
  const sectionBgImage = RETREAT_SECTION_BACKGROUNDS[i % RETREAT_SECTION_BACKGROUNDS.length];
  const sectionBaseTone = reversed ? 'var(--bg-accent-section)' : 'var(--bg)';
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={SMOOTH}
      className={`group relative py-20 lg:py-28 overflow-hidden ${reversed ? 'section-accent' : ''}`}
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-[opacity,transform] duration-[1700ms] ease-out opacity-[0.14] scale-[1.04] group-hover:opacity-[0.62] group-hover:scale-100 group-focus-within:opacity-[0.62] group-focus-within:scale-100"
        style={{
          backgroundImage: `url(${sectionBgImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-opacity duration-[1500ms] ease-out opacity-[0.84] group-hover:opacity-[0.48] group-focus-within:opacity-[0.48]"
        style={{ background: sectionBaseTone }}
      />

      {/* Faded retreat number — Hindu-Rituals styling */}
      <div
        className={`absolute z-10 ${reversed ? 'right-8 lg:right-16' : 'left-8 lg:left-16'} top-8 hero-display select-none pointer-events-none`}
        style={{ fontSize: '9rem', lineHeight: 1, color: 'var(--fg)', opacity: 0.04, fontWeight: 300 }}
      >
        0{i + 1}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-16 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Image */}
        <div className={`lg:col-span-7 ${reversed ? 'lg:order-2' : ''}`}>
          <div className="relative overflow-hidden aspect-[4/3] rounded-sm group">
            <motion.img
              src={r.image}
              alt={r.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 mix-blend-overlay pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(107,160,204,0.15), transparent 60%)' }} />

            {/* Floating meta strip — makemytrip flavor */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-4 py-2.5 backdrop-blur-md rounded-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={1.6} />
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.duration}</span>
              <span className="opacity-30 text-white">·</span>
              <MapPin className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} strokeWidth={1.6} />
              <span className="text-[11px] tracking-[0.25em] uppercase" style={{ color: 'rgba(255,255,255,0.85)' }}>{r.location}</span>
            </div>
          </div>
        </div>

        {/* Text + CTA */}
        <div className={`lg:col-span-5 ${reversed ? 'lg:order-1' : ''}`}>
          <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: 'var(--accent-text)' }}>
            ◊ Retreat 0{i + 1}
          </p>
          <h2 className="hero-display text-4xl lg:text-5xl mb-6" style={{ color: 'var(--fg)' }}>{r.name}</h2>
          <p className="text-[14.5px] font-light leading-relaxed mb-8" style={{ color: 'var(--fg2)' }}>
            {r.desc}
          </p>

          {/* Hover-strip highlights — replaces bullets */}
          <div className="space-y-1.5 mb-10">
            {r.highlights.slice(0, 4).map((h) => (
              <div
                key={h}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all hover-surface"
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="text-[13px] font-light" style={{ color: 'var(--fg)' }}>{h}</span>
              </div>
            ))}
          </div>

          <Link
            to={`/retreats/${r.slug}/book`}
            className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-lg group transition-all hover:translate-y-[-2px]"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <span className="text-xs tracking-[0.25em] uppercase">Book This Retreat</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export default function Retreats() {
  const heroRef = useRef(null);
  const { isDark } = useTheme();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOverlayBackground = isDark
    ? 'linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.24) 55%, transparent 100%)'
    : 'linear-gradient(to top, var(--bg) 0%, rgba(244,242,236,0.58) 11%, rgba(12,10,9,0.16) 32%, transparent 54%)';

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* HERO */}
      <div ref={heroRef} className="relative h-[64vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=90" alt="" className="w-full h-full object-cover opacity-45" />
        </motion.div>
        <div className="absolute inset-0" style={{ background: heroOverlayBackground }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 30%, var(--accent-dim), transparent 55%)' }} />

        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: 'rgba(250,250,249,0.45)' }}>
              ◊ Immersive Journeys
            </p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[780px]"
            >
              {/* 3D heading temporarily disabled for Retreats route.
              <RetreatsHeading3DPhysics text="Retreats" />
              */}
              <h1 className="hero-display text-6xl lg:text-[8rem]" style={{ color: '#fafaf9' }}>
                Retreats
              </h1>
            </motion.div>
            <p className="mt-5 max-w-xl text-[14px] font-light leading-relaxed" style={{ color: 'rgba(250,250,249,0.65)' }}>
              Six guided immersions across India · 3 to 7 days each · single private call to plan your stay.
            </p>
          </div>
        </div>
      </div>

      {/* List of retreats */}
      <div>
        {RETREATS.map((r, i) => <RetreatRow key={r.slug} r={r} i={i} />)}
      </div>

      <Footer />
    </div>
  );
}

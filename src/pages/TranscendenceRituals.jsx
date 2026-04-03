import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

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

export default function TranscendenceRituals() {
  const heroRef = useRef(null);
  const [activePhase, setActivePhase] = useState(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--fg)' }}>
      <div ref={heroRef} className="relative h-[75vh] overflow-hidden" style={{ background: '#0c0a09' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1800&q=90"
            alt="Transcendence"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,10,9,0.3), #0c0a09)' }} />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs tracking-[0.5em] uppercase text-white/40 mb-6"
          >
            Advanced Practice
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl lg:text-8xl font-extralight text-white tracking-tight leading-none mb-6"
          >
            Transcendence
            <br />
            <span className="italic text-white/50">Rituals</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-white/50 font-light max-w-lg text-[15px] leading-relaxed"
          >
            A complete four-phase journey beyond the boundaries of the conditioned self
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-0">
          {/* Phase selector */}
          <div className="lg:col-span-2 lg:pr-16 lg:border-r border-white/10">
            <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-10">The Journey</p>
            <div className="space-y-2">
              {phases.map((phase, i) => (
                <button
                  key={phase.number}
                  onClick={() => setActivePhase(i)}
                  className="w-full text-left group"
                >
                  <motion.div
                    className={`flex items-center gap-6 py-5 border-b transition-colors duration-300 ${
                      activePhase === i ? 'border-white/20' : 'border-white/5'
                    }`}
                  >
                    <span className={`text-xs font-mono transition-colors duration-300 ${activePhase === i ? 'text-white/50' : 'text-white/20'}`}>
                      {phase.number}
                    </span>
                    <div>
                      <p className={`text-[10px] tracking-[0.3em] uppercase mb-1 transition-colors duration-300 ${activePhase === i ? 'text-white/40' : 'text-white/20'}`}>
                        {phase.phase}
                      </p>
                      <p className={`text-lg font-light transition-colors duration-300 ${activePhase === i ? 'text-white' : 'text-white/30'}`}>
                        {phase.title}
                      </p>
                    </div>
                    <span className={`ml-auto text-xs text-white/20 transition-colors duration-300 ${activePhase === i ? 'text-white/40' : ''}`}>
                      {phase.duration}
                    </span>
                  </motion.div>
                </button>
              ))}
            </div>
          </div>

          {/* Phase content */}
          <div className="lg:col-span-3 lg:pl-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="aspect-[16/10] overflow-hidden mb-10">
                  <img
                    src={phases[activePhase].image}
                    alt={phases[activePhase].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-4">{phases[activePhase].phase}</p>
                <h2 className="text-4xl font-extralight text-white mb-6">{phases[activePhase].title}</h2>
                <p className="text-white/50 font-light leading-relaxed text-[15px] max-w-lg">{phases[activePhase].description}</p>
                <motion.button
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.3 }}
                  className="mt-10 text-sm tracking-widest uppercase text-white/60 border-b border-white/20 pb-1 hover:text-white hover:border-white/60 transition-colors duration-300"
                >
                  Inquire About This Phase →
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <Footer />
      </div>
    </div>
  );
}

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const rituals = [
  {
    name: 'Agni Hotra',
    time: 'Dawn & Dusk',
    description: 'The ancient Vedic fire ceremony performed at the precise moment of sunrise and sunset. Sacred offerings of rice and ghee into the fire purify the atmosphere and the practitioner\'s consciousness simultaneously.',
    mantra: 'Svāhā',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=90',
  },
  {
    name: 'Abhisheka',
    time: 'Monthly',
    description: 'The sacred bathing of the deity with milk, honey, rosewater, and sandalwood paste, accompanied by Vedic chanting. This ritual of devotional offering purifies the subtle body of the participant through selfless love.',
    mantra: 'Om Namah Shivaya',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=90',
  },
  {
    name: 'Prana Pratishtha',
    time: 'Ceremonial',
    description: 'The invocation of divine consciousness into a sacred object or space. A complex ritual sequence that awakens dormant spiritual energy within a carefully consecrated vessel — bridging the seen and unseen worlds.',
    mantra: 'Om Tat Sat',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=90',
  },
  {
    name: 'Sankalpa Ritual',
    time: 'New Moon',
    description: 'Setting a sacred intention aligned with cosmic cycles. Performed on new moon nights, this ritual harnesses the potent energy of new beginnings to plant seeds of spiritual transformation into fertile soil.',
    mantra: 'Aham Brahmāsmi',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=90',
  },
];

export default function HinduRituals() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div ref={heroRef} className="relative h-[60vh] overflow-hidden" style={{ background: '#1a0e00' }}>
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=90"
            alt=""
            className="w-full h-full object-cover opacity-45"
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0c0a09 0%, rgba(26,14,0,0.5) 60%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 p-10 lg:p-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[10px] tracking-[0.45em] uppercase mb-4"
            style={{ color: 'rgba(250,200,100,0.5)' }}
          >
            Vedic Traditions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-light tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fafaf9' }}
          >
            Hindu Rituals
          </motion.h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 lg:px-16 py-24">
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          {rituals.map((ritual, i) => (
            <motion.div
              key={ritual.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start py-20"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className={`lg:col-span-3 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative overflow-hidden aspect-[4/3]">
                  <motion.img
                    src={ritual.image}
                    alt={ritual.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
              <div className={`lg:col-span-2 flex flex-col justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-8" style={{ background: 'rgba(200,130,50,0.6)' }} />
                  <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(200,130,50,0.6)' }}>
                    {ritual.time}
                  </span>
                </div>
                <h2
                  className="text-3xl mb-4 tracking-tight leading-tight"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--fg)' }}
                >
                  {ritual.name}
                </h2>
                <p className="font-light leading-relaxed text-[15px] mb-8" style={{ color: 'var(--fg2)' }}>
                  {ritual.description}
                </p>
                <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--fg3)' }}>
                    Sacred Mantra
                  </p>
                  <p
                    className="text-2xl"
                    style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'rgba(200,130,50,0.8)' }}
                  >
                    {ritual.mantra}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

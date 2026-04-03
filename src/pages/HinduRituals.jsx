import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const rituals = [
  {
    name: 'Agni Hotra',
    time: 'Dawn & Dusk',
    description: 'The ancient Vedic fire ceremony performed at the precise moment of sunrise and sunset. Sacred offerings of rice and ghee into the sacred fire purify the atmosphere and the practitioner\'s consciousness.',
    mantra: 'Svāhā',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=90',
  },
  {
    name: 'Abhisheka',
    time: 'Monthly',
    description: 'The sacred bathing of the deity with milk, honey, rosewater, and sandalwood paste, accompanied by Vedic chanting. This ritual of devotional offering purifies the subtle body of the participant.',
    mantra: 'Om Namah Shivaya',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=90',
  },
  {
    name: 'Prana Pratishtha',
    time: 'Ceremonial',
    description: 'The invocation of divine consciousness into a sacred object or space. A complex ritual sequence that awakens dormant spiritual energy within a carefully consecrated vessel.',
    mantra: 'Om Tat Sat',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=90',
  },
  {
    name: 'Sankalpa Ritual',
    time: 'New Moon',
    description: 'Setting a sacred intention aligned with cosmic cycles. Performed on new moon nights, this ritual harnesses the potent energy of new beginnings to plant seeds of spiritual transformation.',
    mantra: 'Aham Brahmāsmi',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=90',
  },
];

export default function HinduRituals() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div className="bg-amber-50/20 min-h-screen">
      <div ref={heroRef} className="relative h-[60vh] overflow-hidden bg-amber-950">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=90"
            alt="Hindu Rituals"
            className="w-full h-full object-cover opacity-40"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 to-amber-950/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase text-amber-200/60 mb-4"
          >
            Vedic Traditions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-extralight text-white tracking-tight"
          >
            Hindu Rituals
          </motion.h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-24">
        <div className="space-y-32">
          {rituals.map((ritual, i) => (
            <motion.div
              key={ritual.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start"
            >
              <div className={`lg:col-span-3 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative overflow-hidden rounded-sm aspect-[4/3]">
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
                  <div className="h-px w-8 bg-amber-600" />
                  <span className="text-xs tracking-[0.3em] uppercase text-amber-700">{ritual.time}</span>
                </div>
                <h2 className="text-3xl font-extralight text-stone-900 mb-4 tracking-tight">{ritual.name}</h2>
                <p className="text-stone-500 font-light leading-relaxed text-[15px] mb-8">{ritual.description}</p>
                <div className="border-t border-stone-200 pt-6">
                  <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2">Sacred Mantra</p>
                  <p className="text-2xl font-extralight text-amber-800 italic">{ritual.mantra}</p>
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

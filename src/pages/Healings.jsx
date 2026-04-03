import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const healings = [
  {
    title: 'Reiki Channeling',
    description: 'Universal life force energy directed through the practitioner\'s hands to dissolve energetic blockages and awaken the body\'s innate healing intelligence.',
    image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=900&q=90',
    duration: '60 — 90 min',
  },
  {
    title: 'Sound Bath Immersion',
    description: 'Crystal and Tibetan singing bowls create cascading resonance fields that align your vibrational frequency with states of deep cellular restoration.',
    image: 'https://images.unsplash.com/photo-1514025538096-5898bc23b3c3?w=900&q=90',
    duration: '45 — 75 min',
  },
  {
    title: 'Pranic Healing',
    description: 'Ancient esoteric science using the life force to treat illness on the energy body, accelerating the body\'s innate ability to heal itself at all levels.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=90',
    duration: '60 min',
  },
  {
    title: 'Craniosacral Therapy',
    description: 'Gentle, non-invasive bodywork that releases tension deep in the body to relieve pain and dysfunction and improve whole-body health and performance.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=90',
    duration: '75 min',
  },
];

function HealingCard({ healing, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group grid lg:grid-cols-2 gap-0 border-t border-stone-200"
    >
      <div className={`relative overflow-hidden aspect-[4/3] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
        <motion.img
          src={healing.image}
          alt={healing.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors duration-700" />
      </div>
      <div className={`flex flex-col justify-center px-12 py-16 bg-white ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <span className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-6">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-3xl lg:text-4xl font-extralight text-stone-900 mb-6 tracking-tight">{healing.title}</h2>
        <p className="text-stone-500 font-light leading-relaxed text-[15px] mb-8">{healing.description}</p>
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-stone-300" />
          <span className="text-xs tracking-widest uppercase text-stone-400">{healing.duration}</span>
        </div>
        <motion.button
          whileHover={{ x: 6 }}
          transition={{ duration: 0.3 }}
          className="mt-8 self-start text-sm tracking-widest uppercase text-stone-800 border-b border-stone-300 pb-1 hover:border-stone-800 transition-colors duration-300"
        >
          Book Session →
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Healings() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div ref={heroRef} className="relative h-[55vh] overflow-hidden bg-stone-900">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1800&q=90"
            alt="Healings"
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase text-white/60 mb-4"
          >
            Energy Medicine
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-extralight text-white tracking-tight"
          >
            Healings
          </motion.h1>
        </div>
      </div>

      <div className="divide-y divide-stone-200">
        {healings.map((healing, index) => (
          <HealingCard key={healing.title} healing={healing} index={index} />
        ))}
      </div>

      <Footer />
    </div>
  );
}

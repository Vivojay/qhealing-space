import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '@/components/wellness/Footer';

const retreats = [
  {
    name: 'Silent Mountain',
    location: 'Himalayas, India',
    duration: '10 Days',
    description: 'Complete digital detox in the foothills of the Himalayas. Vipassana meditation, mountain breathwork, and guided silence.',
    price: 'From $3,200',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=90',
    spots: '8 spots remaining',
  },
  {
    name: 'Coastal Renewal',
    location: 'Algarve, Portugal',
    duration: '7 Days',
    description: 'Ocean-front yoga, cold immersion therapy, and somatic healing in a private estate on the Atlantic coast.',
    price: 'From $2,800',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=90',
    spots: '12 spots remaining',
  },
  {
    name: 'Desert Ceremony',
    location: 'Atacama, Chile',
    duration: '5 Days',
    description: 'Stargazing ceremonies, earth meditations, and indigenous healing rituals under some of the world\'s clearest skies.',
    price: 'From $4,100',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1000&q=90',
    spots: '6 spots remaining',
  },
  {
    name: 'Forest Temple',
    location: 'Kyoto, Japan',
    duration: '8 Days',
    description: 'Zen Buddhist practices, forest bathing in ancient cryptomeria groves, and tea ceremony in a working monastery.',
    price: 'From $3,600',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&q=90',
    spots: '4 spots remaining',
  },
];

export default function Retreats() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <div className="bg-stone-950 min-h-screen">
      <div ref={heroRef} className="relative h-[60vh] overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1800&q=90"
            alt="Retreats"
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 to-stone-950/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4"
          >
            Immersive Journeys
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-extralight text-white tracking-tight"
          >
            Retreats
          </motion.h1>
        </div>
      </div>

      <div className="px-6 lg:px-12 py-24 space-y-px">
        {retreats.map((retreat, i) => (
          <motion.div
            key={retreat.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden"
          >
            <div className="relative h-[70vh] overflow-hidden">
              <motion.img
                src={retreat.image}
                alt={retreat.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-3">{retreat.location} · {retreat.duration}</p>
                  <h2 className="text-4xl lg:text-5xl font-extralight text-white mb-4">{retreat.name}</h2>
                  <p className="text-white/60 font-light max-w-xl text-[15px] leading-relaxed">{retreat.description}</p>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
                  <p className="text-white text-xl font-extralight">{retreat.price}</p>
                  <p className="text-white/40 text-xs tracking-wide">{retreat.spots}</p>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255,255,255,1)', color: '#1c1917' }}
                    className="mt-2 px-8 py-3 border border-white/30 text-white text-xs tracking-widest uppercase transition-colors duration-400"
                  >
                    Reserve
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-stone-950">
        <Footer />
      </div>
    </div>
  );
}

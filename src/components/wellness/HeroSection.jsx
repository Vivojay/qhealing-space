import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100">
            {/* Subtle background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 2 }}
                    className="absolute top-20 right-20 w-96 h-96 bg-sage-200/30 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(180, 200, 180, 0.2)' }}
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute bottom-40 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-sm tracking-[0.3em] uppercase text-stone-500 mb-8 font-light"
                >
                    Holistic Wellness
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-7xl lg:text-8xl font-extralight text-stone-800 leading-[1.1] tracking-tight mb-8"
                >
                    Find Your
                    <span className="block italic font-light text-stone-600">Inner Balance</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg md:text-xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed mb-12"
                >
                    A sanctuary for mindful living, where ancient wisdom meets modern wellness practices
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button className="px-10 py-4 bg-stone-800 text-white text-sm tracking-widest uppercase hover:bg-stone-700 transition-all duration-500 rounded-full">
                        Begin Journey
                    </button>
                    <button className="px-10 py-4 border border-stone-300 text-stone-600 text-sm tracking-widest uppercase hover:border-stone-500 hover:text-stone-800 transition-all duration-500 rounded-full">
                        Explore
                    </button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ArrowDown className="w-5 h-5 text-stone-400" strokeWidth={1} />
                </motion.div>
            </motion.div>
        </section>
    );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Image column */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800&q=80"
                                alt="Wellness space"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Floating accent card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="absolute -bottom-8 -right-8 bg-amber-50 rounded-xl p-6 shadow-xl shadow-stone-200/50 max-w-[200px]"
                        >
                            <p className="text-4xl font-extralight text-stone-800 mb-1">15+</p>
                            <p className="text-xs tracking-widest uppercase text-stone-500">Years of healing</p>
                        </motion.div>
                    </motion.div>

                    {/* Content column */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:pl-8"
                    >
                        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-6">Our Philosophy</p>
                        <h2 className="text-4xl md:text-5xl font-extralight text-stone-800 leading-tight mb-8">
                            Where Ancient Wisdom
                            <span className="block italic font-light text-stone-600">Meets Modern Living</span>
                        </h2>
                        <div className="space-y-6 text-stone-500 font-light leading-relaxed">
                            <p>
                                We believe that true wellness is not a destination, but a continuous journey of 
                                self-discovery and intentional living. Our sanctuary provides the space, guidance, 
                                and community to support your unique path.
                            </p>
                            <p>
                                Drawing from time-honored practices across cultures—from Eastern meditation 
                                traditions to holistic therapeutic techniques—we offer an integrated approach 
                                that honors the interconnection of mind, body, and spirit.
                            </p>
                        </div>

                        <div className="mt-12 flex flex-wrap gap-12">
                            <div>
                                <p className="text-3xl font-extralight text-stone-800">5,000+</p>
                                <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Lives Transformed</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extralight text-stone-800">12</p>
                                <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Expert Practitioners</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extralight text-stone-800">30+</p>
                                <p className="text-xs tracking-widest uppercase text-stone-400 mt-1">Wellness Programs</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
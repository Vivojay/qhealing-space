import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const mediaItems = [
    {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&q=80',
        title: 'Mindful Meditation',
        subtitle: 'Find stillness in motion'
    },
    {
        type: 'video',
        src: 'https://player.vimeo.com/external/434045526.hd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=175',
        poster: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80',
        title: 'Yoga Practice',
        subtitle: 'Breathe and flow'
    },
    {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1600&q=80',
        title: 'Healing Touch',
        subtitle: 'Therapeutic massage'
    },
    {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80',
        title: 'Serene Spaces',
        subtitle: 'Curated environments'
    },
    {
        type: 'video',
        src: 'https://player.vimeo.com/external/370331493.hd.mp4?s=e90dcaba73c19e0e36f03406b47bbd6992dd6c1c&profile_id=175',
        poster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80',
        title: 'Nature Immersion',
        subtitle: 'Connect with earth'
    }
];

export default function MediaCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [direction, setDirection] = useState(1);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    }, []);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isPlaying, nextSlide]);

    const currentItem = mediaItems[currentIndex];

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1.1
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        exit: (direction) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        })
    };

    return (
        <section className="relative bg-stone-100 py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Experience</p>
                    <h2 className="text-4xl md:text-5xl font-extralight text-stone-800">Our Sanctuary</h2>
                </motion.div>

                {/* Carousel container */}
                <div className="relative aspect-[16/9] max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl shadow-stone-300/50">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0"
                        >
                            {currentItem.type === 'image' ? (
                                <img
                                    src={currentItem.src}
                                    alt={currentItem.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    src={currentItem.src}
                                    poster={currentItem.poster}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

                            {/* Content overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="absolute bottom-0 left-0 right-0 p-8 md:p-12"
                            >
                                <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
                                    {currentItem.subtitle}
                                </p>
                                <h3 className="text-white text-3xl md:text-4xl font-light">
                                    {currentItem.title}
                                </h3>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    >
                        <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    >
                        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Play/Pause button */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute top-4 md:top-8 right-4 md:right-8 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-3 mt-8">
                    {mediaItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className="group relative h-1 w-12 bg-stone-300 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="absolute inset-0 bg-stone-700 origin-left"
                                initial={{ scaleX: 0 }}
                                animate={{ 
                                    scaleX: index === currentIndex ? 1 : 0 
                                }}
                                transition={{ 
                                    duration: index === currentIndex && isPlaying ? 6 : 0.3,
                                    ease: "linear"
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
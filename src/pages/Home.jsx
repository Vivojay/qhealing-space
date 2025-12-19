import React from 'react';
import HeroSection from '@/components/wellness/HeroSection';
import MediaCarousel from '@/components/wellness/MediaCarousel';
import TestimonialsMarquee from '@/components/wellness/TestimonialsMarquee';
import AboutSection from '@/components/wellness/AboutSection';
import ServicesSection from '@/components/wellness/ServicesSection';
import Footer from '@/components/wellness/Footer';

export default function Home() {
    return (
        <div className="bg-stone-50">
            <HeroSection />
            <AboutSection />
            <MediaCarousel />
            <ServicesSection />
            <TestimonialsMarquee />
            <Footer />
        </div>
    );
}

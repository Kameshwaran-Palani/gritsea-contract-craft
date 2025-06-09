
import React from 'react';
import Navbar from '@/components/ui/navbar';
import HeroSection from '@/components/ui/hero-section';
import FeaturesSection from '@/components/ui/features-section';
import TestimonialsSection from '@/components/ui/testimonials-section';
import PricingSection from '@/components/ui/pricing-section';
import ContactSection from '@/components/ui/contact-section';
import Footer from '@/components/ui/footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <TestimonialsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

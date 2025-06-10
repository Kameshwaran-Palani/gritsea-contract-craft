
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import PricingSection from "@/components/ui/pricing-section";
import TestimonialsSection from "@/components/ui/testimonials-section";
import ContactSection from "@/components/ui/contact-section";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Helmet>
        <title>Agrezy - Legal Service Agreements Made Simple</title>
        <meta name="description" content="Craft Legal Service Agreements in Minutes with Agrezy. Fast, Freelance-Friendly & Fully Compliant Contracts with AI Assistance for Indian freelancers." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Agrezy",
            "description": "AI-powered contract builder for freelancers and clients to create legally valid service agreements in India",
            "url": "https://agrezy.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            }
          })}
        </script>
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

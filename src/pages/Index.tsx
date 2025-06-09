
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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GritSea",
            "description": "Professional contract management platform for freelancers and agencies",
            "url": "https://gritsea.com",
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

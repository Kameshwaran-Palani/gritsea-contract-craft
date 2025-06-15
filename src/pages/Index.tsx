
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/ui/navbar";
import HeroSection from "@/components/ui/hero-section";
import TestimonialsSection from "@/components/ui/testimonials-section";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/SEOHead";
import HowItWorksSection from "@/components/ui/how-it-works";
import UseCasesSection from "@/components/ui/use-cases";
import AIPoweredSection from "@/components/ui/ai-powered";
import BuiltForIndiaSection from "@/components/ui/built-for-india";
import CommunitySection from "@/components/ui/community-section";
import PricingSection from "@/components/ui/pricing-section";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Helmet>
        <title>Agrezy - Service Agreements Made Simple</title>
        <meta name="description" content="Craft Service Agreements in Minutes with Agrezy. Fast, Freelance-Friendly & Fully Compliant Contracts with AI Assistance for Indian freelancers." />
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
        <HowItWorksSection />
        <UseCasesSection />
        <AIPoweredSection />
        <BuiltForIndiaSection />
        <PricingSection />
        <TestimonialsSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

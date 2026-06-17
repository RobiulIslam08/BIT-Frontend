// ============================================
// BIT SOFTWARE — HOME PAGE (Premium Rebuild)
// ============================================

import { SEOHead } from '@/components/common/SEOHead';
import { ScrollBlurReveal } from '@/components/animations/ScrollBlurReveal';
import HeroSection from './HeroSection';
import ServicesOverview from './ServicesOverview';
import WhyChooseUs from './WhyChooseUs';
import StatsSection from './StatsSection';
import ProcessSection from './ProcessSection';
import FeaturedWork from './FeaturedWork';
import TestimonialsSection from './TestimonialsSection';
import TechStack from './TechStack';
import CTASection from './CTASection';

export default function Home() {
  return (
    <>
      <SEOHead
        title="World-Class IT Solutions & ZATCA ERP in Saudi Arabia"
        description="BIT Software & IT Solution delivers premium custom SaaS, ZATCA e-invoicing ERP platforms, web design, and mobile app development services in Riyadh."
      />
      {/* Hero is above the fold, so it loads without scroll-blur reveal for instant interaction */}
      <HeroSection />
      
      <ScrollBlurReveal>
        <ServicesOverview />
      </ScrollBlurReveal>
      
      <ScrollBlurReveal>
        <WhyChooseUs />
      </ScrollBlurReveal>
      
      <ScrollBlurReveal>
        <StatsSection />
      </ScrollBlurReveal>
      
      <ScrollBlurReveal>
        <ProcessSection />
      </ScrollBlurReveal>

      <ScrollBlurReveal>
        <FeaturedWork />
      </ScrollBlurReveal>
      
      <ScrollBlurReveal>
        <TestimonialsSection />
      </ScrollBlurReveal>

      <ScrollBlurReveal>
        <TechStack />
      </ScrollBlurReveal>
      
      <ScrollBlurReveal>
        <CTASection />
      </ScrollBlurReveal>
    </>
  );
}

// BIT SOFTWARE — Logo Design Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Palette, PenTool, Eye, FileText, Layers, Sparkles } from 'lucide-react';

export default function LogoDesign() {
  return <ServicePageTemplate
    seo={{ title: 'Logo Design', description: 'Professional logo design services — memorable brand identities for Saudi businesses.' }}
    hero={{ subtitle: 'Logo Design', title: 'Logos That Define Your Brand in Saudi Arabia', description: 'We create memorable, versatile brand identities that resonate with Saudi and international audiences. From concept to final files.', badges: ['Unlimited Revisions', 'All File Formats', 'Brand Guide'] }}
    features={{ items: [
      { icon: PenTool, title: 'Custom Logo Design', desc: '100% original logos crafted specifically for your brand.' },
      { icon: Palette, title: 'Color Palette', desc: 'Professional color schemes that align with your brand personality.' },
      { icon: FileText, title: 'Brand Guidelines', desc: 'Complete brand guide with usage rules, fonts, and color codes.' },
      { icon: Layers, title: 'Multiple Concepts', desc: 'We present 3-5 unique concepts for you to choose from.' },
      { icon: Eye, title: 'Arabic & English', desc: 'Bilingual logo versions with Arabic calligraphy options.' },
      { icon: Sparkles, title: 'All Formats', desc: 'Delivered in SVG, PNG, AI, PDF, and all formats you need.' },
    ]}}
    stats={[{ value: 200, suffix: '+', label: 'Logos Designed' }, { value: 100, suffix: '%', label: 'Client Satisfaction' }, { value: 3, suffix: '-5', label: 'Concepts Provided' }, { value: 5, suffix: 'days', label: 'Average Delivery' }]}
    faqs={[
      { q: 'How many concepts do you provide?', a: 'We provide 3-5 unique logo concepts for you to choose from.' },
      { q: 'How many revisions are included?', a: 'Unlimited revisions until you are 100% satisfied.' },
      { q: 'What files will I receive?', a: 'SVG, PNG, AI, PDF, EPS — all formats for web and print.' },
      { q: 'Do you create Arabic logos?', a: 'Yes, we create bilingual logos with professional Arabic calligraphy.' },
    ]}
  />;
}

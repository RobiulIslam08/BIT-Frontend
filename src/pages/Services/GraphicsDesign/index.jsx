// BIT SOFTWARE — Graphics Design Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Image, Printer, Layout, FileImage, Video, BookOpen } from 'lucide-react';

export default function GraphicsDesign() {
  return <ServicePageTemplate
    seo={{ title: 'Graphics Design', description: 'Professional graphics design — brochures, flyers, social media graphics, and print design for Saudi businesses.' }}
    hero={{ subtitle: 'Graphics Design', title: 'Stunning Visual Designs That Captivate Your Audience', description: 'From social media graphics to print materials — we create compelling visual content that elevates your brand.' }}
    features={{ items: [
      { icon: Image, title: 'Social Media Graphics', desc: 'Eye-catching posts, stories, and ad creatives for all platforms.' },
      { icon: Printer, title: 'Print Design', desc: 'Business cards, brochures, flyers, and packaging design.' },
      { icon: Layout, title: 'Marketing Materials', desc: 'Presentations, infographics, and email templates.' },
      { icon: FileImage, title: 'Banner & Signage', desc: 'Large-format designs for exhibitions, billboards, and signage.' },
      { icon: Video, title: 'Motion Graphics', desc: 'Animated graphics for social media and video content.' },
      { icon: BookOpen, title: 'Brand Collateral', desc: 'Letterheads, envelopes, and complete brand material packages.' },
    ]}}
    stats={[{ value: 500, suffix: '+', label: 'Designs Created' }, { value: 100, suffix: '+', label: 'Clients Served' }, { value: 24, suffix: 'hr', label: 'Fast Turnaround' }, { value: 5, suffix: '★', label: 'Client Rating' }]}
    faqs={[
      { q: 'What types of designs do you create?', a: 'Social media graphics, print materials, presentations, banners, and brand collateral.' },
      { q: 'What is the turnaround time?', a: 'Most designs are delivered within 24-48 hours.' },
      { q: 'Do you offer design packages?', a: 'Yes, we offer monthly design packages for businesses with ongoing needs.' },
    ]}
  />;
}

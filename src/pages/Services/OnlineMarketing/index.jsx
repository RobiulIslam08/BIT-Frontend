// BIT SOFTWARE — Online Marketing Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Search, TrendingUp, Target, Mail, BarChart3, Globe } from 'lucide-react';

export default function OnlineMarketing() {
  return <ServicePageTemplate
    seo={{ title: 'Online Marketing', description: 'SEO, SEM, and digital marketing for Saudi businesses. Drive traffic, leads, and revenue.' }}
    hero={{ subtitle: 'Online Marketing', title: 'Digital Marketing Strategies That Deliver Results', description: 'Data-driven SEO, Google Ads, and digital marketing campaigns designed for the Saudi market. More traffic, more leads, more revenue.', badges: ['SEO Experts', 'Google Ads Certified', 'ROI Focused'] }}
    features={{ items: [
      { icon: Search, title: 'SEO (Search Engine Optimization)', desc: 'Rank higher on Google for your target keywords in Saudi Arabia.' },
      { icon: TrendingUp, title: 'SEM (Search Engine Marketing)', desc: 'Google Ads campaigns with precise targeting and bid management.' },
      { icon: Target, title: 'PPC Advertising', desc: 'Pay-per-click campaigns across Google, Facebook, and Instagram.' },
      { icon: Mail, title: 'Email Marketing', desc: 'Automated email campaigns with segmentation and analytics.' },
      { icon: BarChart3, title: 'Analytics & Reporting', desc: 'Detailed monthly reports with ROI tracking and insights.' },
      { icon: Globe, title: 'Content Marketing', desc: 'Blog content, articles, and thought leadership pieces.' },
    ]}}
    stats={[{ value: 300, suffix: '%', label: 'Avg Traffic Increase' }, { value: 50, suffix: '+', label: 'Clients Ranked #1' }, { value: 10, suffix: 'x', label: 'ROI Achieved' }, { value: 1, suffix: 'M+', label: 'Leads Generated' }]}
    faqs={[
      { q: 'How long does SEO take to show results?', a: 'Typically 3-6 months for significant ranking improvements.' },
      { q: 'Do you manage Google Ads?', a: 'Yes, we are Google Ads certified and manage campaigns for Saudi businesses.' },
      { q: 'What is your reporting frequency?', a: 'We provide detailed monthly reports with ROI tracking.' },
    ]}
  />;
}

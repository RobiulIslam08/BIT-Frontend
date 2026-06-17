// BIT SOFTWARE — Social Media Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Share2, Camera, Video, BarChart3, MessageCircle, Target } from 'lucide-react';

export default function SocialMedia() {
  return <ServicePageTemplate
    seo={{ title: 'Social Media Management', description: 'Professional social media management for Saudi businesses — Facebook, Instagram, WhatsApp, Snapchat.' }}
    hero={{ subtitle: 'Social Media', title: 'Grow Your Brand on Social Media in Saudi Arabia', description: 'Strategic social media management across Facebook, Instagram, WhatsApp Business, and Snapchat — content creation, scheduling, and paid ads management.', badges: ['4 Platforms', 'Content Creation', 'Ad Management'] }}
    features={{ items: [
      { icon: Camera, title: 'Content Creation', desc: 'Professional graphics, videos, and copy in Arabic and English.' },
      { icon: Share2, title: 'Multi-Platform Management', desc: 'Facebook, Instagram, WhatsApp Business, and Snapchat managed together.' },
      { icon: Target, title: 'Paid Advertising', desc: 'Strategic ad campaigns with precise Saudi audience targeting.' },
      { icon: MessageCircle, title: 'Community Management', desc: 'Engagement, response management, and reputation monitoring.' },
      { icon: BarChart3, title: 'Analytics & Reporting', desc: 'Monthly performance reports with actionable insights.' },
      { icon: Video, title: 'Video Content', desc: 'Short-form video content for Reels, Stories, and TikTok.' },
    ]}}
    stats={[{ value: 50, suffix: '+', label: 'Clients Managed' }, { value: 2, suffix: 'M+', label: 'Reach Generated' }, { value: 500, suffix: '%', label: 'Avg Engagement Increase' }, { value: 30, suffix: '+', label: 'Campaigns Monthly' }]}
    faqs={[
      { q: 'Which platforms do you manage?', a: 'We manage Facebook, Instagram, WhatsApp Business, Snapchat, and TikTok.' },
      { q: 'Do you create the content?', a: 'Yes, our team creates all graphics, videos, and copy.' },
      { q: 'Do you offer paid ads management?', a: 'Yes, we manage Facebook Ads, Instagram Ads, and Snapchat Ads.' },
      { q: 'What packages do you offer?', a: 'We offer Starter (2 platforms), Growth (4 platforms), and Premium (all platforms + ads).' },
    ]}
  />;
}

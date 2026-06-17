// BIT SOFTWARE — Mobile Apps Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Smartphone, Globe, CreditCard, Bell, Shield, Zap } from 'lucide-react';

export default function MobileApps() {
  return <ServicePageTemplate
    seo={{ title: 'Mobile App Development', description: 'Android & iOS app development for Saudi Arabia — Arabic RTL, Mada payments, App Store deployment.' }}
    hero={{ subtitle: 'Mobile Apps', title: 'Android & iOS Apps Built for the Saudi Market', description: 'Native and cross-platform mobile applications with Arabic RTL support, Saudi payment integration, and App Store + Google Play deployment.', badges: ['iOS & Android', 'Arabic RTL', 'Mada & Apple Pay'] }}
    features={{ items: [
      { icon: Smartphone, title: 'Native & Cross-Platform', desc: 'React Native or Flutter apps that feel native on both iOS and Android.' },
      { icon: Globe, title: 'Arabic RTL Support', desc: 'Full right-to-left layout with Arabic typography from day one.' },
      { icon: CreditCard, title: 'Saudi Payment Integration', desc: 'Mada, Apple Pay, and local payment gateway integration.' },
      { icon: Bell, title: 'Push Notifications', desc: 'Bilingual push notifications in Arabic and English.' },
      { icon: Shield, title: 'App Store Deployment', desc: 'We handle Apple App Store and Google Play submission and approval.' },
      { icon: Zap, title: 'Performance Optimized', desc: '60fps animations and fast load times on all devices.' },
    ]}}
    whyUs={{ items: [
      { title: 'Saudi Market Focus', desc: 'Apps designed specifically for Saudi users and business requirements.' },
      { title: 'Full Stack', desc: 'We build both the app and the backend API — one team, one vision.' },
      { title: 'Store Submission', desc: 'We handle the entire App Store and Google Play submission process.' },
      { title: 'Ongoing Maintenance', desc: 'Post-launch support, updates, and feature additions.' },
    ]}}
    stats={[{ value: 30, suffix: '+', label: 'Apps Built' }, { value: 4.8, suffix: '/5', label: 'Avg Rating' }, { value: 100, suffix: 'K+', label: 'Downloads' }, { value: 2, suffix: '', label: 'Platforms' }]}
    faqs={[
      { q: 'Do you build for both iOS and Android?', a: 'Yes, we build cross-platform apps using React Native or Flutter.' },
      { q: 'How long does app development take?', a: 'Typical apps take 4-8 weeks depending on complexity.' },
      { q: 'Do you support Arabic RTL?', a: 'Yes, every app includes full Arabic RTL support.' },
      { q: 'Do you handle App Store submission?', a: 'Yes, we manage the entire submission and approval process.' },
    ]}
  />;
}

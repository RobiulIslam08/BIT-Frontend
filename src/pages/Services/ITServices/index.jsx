// BIT SOFTWARE — IT Services Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Monitor, Shield, Wifi, HardDrive, Headphones, Settings } from 'lucide-react';

export default function ITServices() {
  return <ServicePageTemplate
    seo={{ title: 'IT Services', description: 'Comprehensive IT services for Saudi businesses — network setup, security, support, and infrastructure management.' }}
    hero={{ subtitle: 'IT Services', title: 'Enterprise IT Solutions for Saudi Businesses', description: 'End-to-end IT infrastructure services including network setup, cybersecurity, cloud migration, and 24/7 technical support.', badges: ['24/7 Support', 'Saudi Based', '15+ Engineers'] }}
    features={{ title: 'Our IT Service Offerings', items: [
      { icon: Monitor, title: 'IT Infrastructure Setup', desc: 'Complete network design, server setup, and workstation configuration.' },
      { icon: Shield, title: 'Cybersecurity', desc: 'Enterprise-grade security solutions including firewalls, antivirus, and monitoring.' },
      { icon: Wifi, title: 'Network Management', desc: 'Wired and wireless network design, installation, and ongoing management.' },
      { icon: HardDrive, title: 'Cloud Services', desc: 'Cloud migration, hosting, and management on AWS, Azure, or Google Cloud.' },
      { icon: Headphones, title: '24/7 IT Support', desc: 'Round-the-clock technical support for all your IT needs.' },
      { icon: Settings, title: 'IT Consulting', desc: 'Strategic IT planning and consultation to align technology with business goals.' },
    ]}}
    whyUs={{ items: [
      { title: 'Saudi-Based Team', desc: 'Local engineers who understand Saudi business requirements and regulations.' },
      { title: 'Rapid Response', desc: 'Average response time under 30 minutes for critical issues.' },
      { title: 'Proactive Monitoring', desc: 'We catch and fix problems before they impact your business.' },
      { title: 'Scalable Solutions', desc: 'IT infrastructure that grows with your business needs.' },
    ]}}
    stats={[
      { value: 50, suffix: '+', label: 'Active Clients' },
      { value: 99, suffix: '%', label: 'Uptime Guarantee' },
      { value: 30, suffix: 'min', label: 'Response Time' },
      { value: 24, suffix: '/7', label: 'Support Available' },
    ]}
    faqs={[
      { q: 'What IT services do you offer?', a: 'We offer infrastructure setup, cybersecurity, network management, cloud services, 24/7 support, and IT consulting.' },
      { q: 'Do you provide on-site support?', a: 'Yes, we provide both on-site and remote support across Saudi Arabia.' },
      { q: 'What is your response time?', a: 'Our average response time is under 30 minutes for critical issues.' },
      { q: 'Can you manage our existing infrastructure?', a: 'Absolutely. We can audit, optimize, and manage your current IT setup.' },
    ]}
  />;
}

// BIT SOFTWARE — IT Management Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Server, Shield, Wifi, Cloud, Monitor, Headphones } from 'lucide-react';

export default function ITManagement() {
  return <ServicePageTemplate
    seo={{ title: 'IT Management', description: 'Complete IT infrastructure management and support for Saudi businesses.' }}
    hero={{ subtitle: 'IT Management', title: 'End-to-End IT Infrastructure Management', description: 'Let us handle your IT so you can focus on your business. Complete infrastructure management, monitoring, and support.', badges: ['24/7 Monitoring', 'Proactive Maintenance', 'Saudi Based'] }}
    features={{ items: [
      { icon: Server, title: 'Server Management', desc: 'Server setup, monitoring, and maintenance for optimal performance.' },
      { icon: Shield, title: 'Security Management', desc: 'Firewalls, antivirus, and security monitoring to protect your data.' },
      { icon: Wifi, title: 'Network Management', desc: 'Network design, optimization, and troubleshooting.' },
      { icon: Cloud, title: 'Cloud Management', desc: 'Cloud infrastructure management and optimization.' },
      { icon: Monitor, title: 'Endpoint Management', desc: 'Desktop, laptop, and device management for your team.' },
      { icon: Headphones, title: 'Help Desk', desc: 'Dedicated help desk for your employees with ticket tracking.' },
    ]}}
    stats={[{ value: 40, suffix: '+', label: 'Managed Clients' }, { value: 99.9, suffix: '%', label: 'Uptime' }, { value: 15, suffix: 'min', label: 'Response Time' }, { value: 0, suffix: '', label: 'Data Breaches' }]}
    faqs={[
      { q: 'What does IT management include?', a: 'Server, network, security, cloud, endpoint management, and help desk support.' },
      { q: 'Is it 24/7 monitoring?', a: 'Yes, we monitor your infrastructure around the clock.' },
      { q: 'Do you provide on-site support?', a: 'Yes, on-site support is available across Saudi Arabia.' },
    ]}
  />;
}

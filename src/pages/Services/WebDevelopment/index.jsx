// BIT SOFTWARE — Web Development Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Globe, ShoppingCart, GraduationCap, BookOpen, Truck, Users, Code, Package } from 'lucide-react';

export default function WebDevelopment() {
  return <ServicePageTemplate
    seo={{ title: 'Web Development', description: 'Custom web development services in Saudi Arabia — e-commerce, educational platforms, LMS, corporate websites, and more.' }}
    hero={{ subtitle: 'Web Development', title: 'We Build Websites That Win Customers in Saudi Arabia', description: 'Custom web applications built with React, Laravel, and modern technologies. From e-commerce to enterprise portals, we deliver pixel-perfect, blazing-fast websites.', badges: ['React 19', '100/100 Lighthouse', 'RTL Support'] }}
    features={{ title: 'Web Development Services', items: [
      { icon: ShoppingCart, title: 'E-Commerce Platforms', desc: 'Custom online stores with Mada, Apple Pay, and Saudi payment integration.' },
      { icon: GraduationCap, title: 'Educational Platforms', desc: 'School and university websites with student portals and course management.' },
      { icon: BookOpen, title: 'LMS (Learning Management)', desc: 'Full-featured learning platforms with video hosting and progress tracking.' },
      { icon: Truck, title: 'Supply Company Portals', desc: 'Inventory, ordering, and logistics management web applications.' },
      { icon: Users, title: 'Manpower & HR Portals', desc: 'Construction and manpower management websites with worker tracking.' },
      { icon: Code, title: 'Custom Web Applications', desc: 'Bespoke web applications tailored to your unique business requirements.' },
      { icon: Package, title: 'Drop Shipping Stores', desc: 'Automated drop shipping stores with supplier integration.' },
      { icon: Globe, title: 'Corporate Websites', desc: 'Professional corporate websites that build trust and generate leads.' },
    ]}}
    whyUs={{ items: [
      { title: 'Saudi Market Expertise', desc: 'Arabic RTL design, Saudi payment gateways, and ZATCA compliance built in.' },
      { title: 'Performance Obsessed', desc: 'Every website targets 100/100 Lighthouse score for maximum speed.' },
      { title: 'Modern Tech Stack', desc: 'React 19, Laravel 11, and Tailwind v4 — the latest and greatest.' },
      { title: 'SEO From Day One', desc: 'Every page is optimized for Google search from the ground up.' },
    ]}}
    stats={[
      { value: 150, suffix: '+', label: 'Websites Built' },
      { value: 100, suffix: '/100', label: 'Lighthouse Score' },
      { value: 40, suffix: '%', label: 'Average Sales Increase' },
      { value: 2, suffix: 'wk', label: 'Average Delivery' },
    ]}
    faqs={[
      { q: 'What technologies do you use?', a: 'We primarily use React 19, Laravel 11, Tailwind CSS v4, and MySQL for our web projects.' },
      { q: 'How long does it take to build a website?', a: 'Typical projects take 2-6 weeks depending on complexity and scope.' },
      { q: 'Do you provide hosting?', a: 'Yes, we offer reliable hosting packages. Check our Domain & Hosting page for details.' },
      { q: 'Do you support Arabic/RTL websites?', a: 'Absolutely. Every website we build includes full Arabic RTL support.' },
      { q: 'What about SEO?', a: 'SEO is built into every project. We optimize meta tags, page speed, and structured data.' },
      { q: 'Can you redesign my existing website?', a: 'Yes, we can redesign and modernize existing websites while preserving your content and SEO rankings.' },
    ]}
  />;
}

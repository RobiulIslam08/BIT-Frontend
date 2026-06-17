// BIT SOFTWARE — ERP Software Page
import { ServicePageTemplate } from '@/components/sections/ServicePageTemplate';
import { Database, Receipt, Users, Warehouse, BarChart3, Globe } from 'lucide-react';

export default function ERPSoftware() {
  return <ServicePageTemplate
    seo={{ title: 'ERP & POS Software', description: 'ZATCA-compliant ERP and POS solutions for Saudi businesses. Inventory, HR, payroll, and accounting.' }}
    hero={{ subtitle: 'ERP & POS Software', title: 'Streamline Your Saudi Business Operations With Smart ERP', description: 'Complete ERP and POS solutions designed for Saudi Arabia — ZATCA e-invoicing, Arabic interface, multi-branch support, and VAT reporting.', badges: ['ZATCA Compliant', 'Fatoora Support', 'Multi-Branch'] }}
    features={{ title: 'ERP Modules', items: [
      { icon: Warehouse, title: 'Inventory Management', desc: 'Real-time stock tracking, automated reordering, and multi-warehouse support.' },
      { icon: Users, title: 'HR & Payroll', desc: 'Saudi labor law compliant HR with payroll, leave, and employee management.' },
      { icon: Receipt, title: 'Accounts & VAT', desc: 'Full accounting suite with ZATCA VAT reporting and e-invoicing.' },
      { icon: Database, title: 'Point of Sale (POS)', desc: 'Fast POS for restaurants, retail, and warehouses with Arabic interface.' },
      { icon: Globe, title: 'Multi-Branch Support', desc: 'Manage multiple locations from a single dashboard with real-time sync.' },
      { icon: BarChart3, title: 'Reports & Analytics', desc: 'Comprehensive business intelligence with customizable dashboards.' },
    ]}}
    whyUs={{ items: [
      { title: 'ZATCA Compliant', desc: 'Full compliance with Saudi e-invoicing regulations from day one.' },
      { title: 'Arabic Interface', desc: 'Native Arabic RTL interface designed for Saudi users.' },
      { title: 'Scalable Architecture', desc: 'From single shop to enterprise — our ERP grows with you.' },
      { title: 'Local Support', desc: 'Saudi-based support team with on-site installation available.' },
    ]}}
    stats={[
      { value: 80, suffix: '+', label: 'Active Installations' },
      { value: 99, suffix: '%', label: 'Uptime' },
      { value: 500, suffix: '+', label: 'Daily Transactions' },
      { value: 24, suffix: '/7', label: 'Support' },
    ]}
    faqs={[
      { q: 'Is your ERP ZATCA compliant?', a: 'Yes, our ERP fully supports ZATCA e-invoicing (Fatoora) and VAT reporting.' },
      { q: 'Can it handle multiple branches?', a: 'Yes, our multi-branch module syncs data in real-time across all locations.' },
      { q: 'Do you offer a POS system?', a: 'Yes, our POS works for restaurants, retail stores, and warehouses.' },
      { q: 'Is training included?', a: 'Yes, we provide full training and documentation for all users.' },
    ]}
  />;
}

// BIT SOFTWARE — Dashboard Home
import { TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Counter } from '@/components/animations/CounterAnimation';
import { SEOHead } from '@/components/common/SEOHead';

const KPIS = [
  { label: 'Active Services', value: 12, icon: TrendingUp, color: '#00FFFF' },
  { label: 'Leads This Month', value: 47, icon: FileText, color: '#10B981' },
  { label: 'Total Orders', value: 156, icon: Users, color: '#3B82F6' },
  { label: 'Revenue (SAR)', value: 85400, prefix: '', suffix: '', icon: DollarSign, color: '#F59E0B' },
];

export default function DashboardHome() {
  return (
    <>
      <SEOHead title="Dashboard" />
      <div>
        <h1 className="h3" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
        <p className="body-sm" style={{ marginBottom: '2rem' }}>Welcome back! Here's an overview of your business.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {KPIS.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <kpi.icon size={22} style={{ color: kpi.color }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{kpi.label}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  <Counter to={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card-elevated">
          <h3 className="h5" style={{ marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['New lead from Google My Business form', 'Service "Web Development" updated', 'New order received — E-commerce Package', 'User Ahmed registered', 'Hosting plan purchased — Business Plan'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>{item}</span>
                <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{i + 1}h ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// BIT SOFTWARE — Dashboard Services Management
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

const MOCK_SERVICES = [
  { id: 1, title: 'Web Development', status: 'active', featured: true },
  { id: 2, title: 'ERP Software', status: 'active', featured: true },
  { id: 3, title: 'Mobile Apps', status: 'active', featured: false },
  { id: 4, title: 'Social Media', status: 'active', featured: false },
  { id: 5, title: 'Logo Design', status: 'inactive', featured: false },
];

export default function DashboardServices() {
  return (
    <>
      <SEOHead title="Manage Services" />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h1 className="h3">Services</h1>
          <button className="btn btn-primary"><Plus size={16} /> Add Service</button>
        </div>
        <div className="card-elevated" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Service', 'Status', 'Featured', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SERVICES.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.title}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}><span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{s.featured ? <Eye size={16} style={{ color: 'var(--color-success)' }} /> : <EyeOff size={16} style={{ color: 'var(--color-text-muted)' }} />}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm"><Edit size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

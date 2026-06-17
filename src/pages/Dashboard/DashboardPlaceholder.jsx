// BIT SOFTWARE — Dashboard Offers, Leads, Orders, Users, Analytics, Settings
import { SEOHead } from '@/components/common/SEOHead';

function DashboardPlaceholder({ title, description }) {
  return (
    <>
      <SEOHead title={title} />
      <div>
        <h1 className="h3" style={{ marginBottom: '0.5rem' }}>{title}</h1>
        <p className="body-sm" style={{ marginBottom: '2rem' }}>{description}</p>
        <div className="card-elevated" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</p>
          <h3 className="h4" style={{ marginBottom: '0.5rem' }}>Coming Soon</h3>
          <p className="body-sm">This feature is under development and will be available once the backend is connected.</p>
        </div>
      </div>
    </>
  );
}

export default DashboardPlaceholder;

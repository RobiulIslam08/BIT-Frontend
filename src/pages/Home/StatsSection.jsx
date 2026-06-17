// ============================================
// BIT SOFTWARE — Stats Section (Premium Rebuild)
// ============================================

import { Counter } from '@/components/animations/CounterAnimation';
import './Home.css';

const STATS_DATA = [
  { value: 250, suffix: '+', label: 'Projects Delivered' },
  { value: 8, suffix: '+', label: 'Years Active' },
  { value: 98, suffix: '%', label: 'Client Retention' },
  { value: 15, suffix: 'm', label: 'Avg. Response Time' }
];

export default function StatsSection() {
  return (
    <section className="stats section-sm">
      <div className="container">
        <div className="stats__grid">
          {STATS_DATA.map((stat, idx) => (
            <div key={stat.label} className="stats__item" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="stats__value">
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="stats__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

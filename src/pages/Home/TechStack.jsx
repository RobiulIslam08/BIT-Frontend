// ============================================
// BIT SOFTWARE — Tech Stack (Grayscale to Color)
// ============================================

import { Code2, Server, Database, Cloud, Terminal, Cpu, Layers, Workflow } from 'lucide-react';
import './Home.css';

const TECHS = [
  { name: 'React', icon: Code2, color: '#61DAFB' },
  { name: 'NodeJS', icon: Server, color: '#339933' },
  { name: 'NextJS', icon: Layers, color: '#000000' },
  { name: 'Tailwind', icon: Cpu, color: '#38BDF8' },
  { name: 'Postgres', icon: Database, color: '#4169E1' },
  { name: 'AWS Cloud', icon: Cloud, color: '#FF9900' },
  { name: 'Python', icon: Terminal, color: '#3776AB' },
  { name: 'Docker', icon: Workflow, color: '#2496ED' }
];

export default function TechStack() {
  return (
    <section className="tech-stack section-sm">
      <div className="container">
        <div className="tech-stack__inner">
          <div className="tech-stack__label">Our Engineering Core</div>
          <div className="tech-stack__grid">
            {TECHS.map((tech) => {
              const IconComponent = tech.icon;
              return (
                <div
                  key={tech.name}
                  className="tech-stack__logo-item"
                  style={{ '--tech-color-hover': tech.color }}
                >
                  <IconComponent size={24} className="tech-stack__icon" />
                  <span className="tech-stack__name">{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

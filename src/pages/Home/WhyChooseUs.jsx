// ============================================
// BIT SOFTWARE — Why Choose Us (Ownable Differentiators)
// ============================================

import { Check, ShieldCheck, Users, Code2, KeyRound, Server, Zap } from 'lucide-react';
import './Home.css';

const DIFFERENTIATORS = [
  {
    number: '01',
    icon: Server,
    title: 'ZATCA Phase-2 Certified E-Invoicing',
    desc: 'Fully compliant with Saudi ZATCA Phase-2 sandbox and production APIs, handling cryptographic stamping, XML generation, and direct server integration.',
    highlights: ['XML Tamper Validation', 'Cryptographic Signatures', 'Phase-2 Sandbox Integration']
  },
  {
    number: '02',
    icon: Users,
    title: 'SLA-Backed In-House Team',
    desc: 'No external freelancers or outsourcing. Every developer is a full-time, in-house team member, guaranteeing SLA response times under 4 hours for enterprise software.',
    highlights: ['4-Hour Support SLA', 'Dedicated Tech Leads', 'Direct Engineering Channels']
  },
  {
    number: '03',
    icon: Code2,
    title: 'Bespoke Clean-Code Architectures',
    desc: 'No bloated page builders or pre-made templates. We build custom React, Next.js, Node.js, and Go architectures designed for sub-second load times.',
    highlights: ['95+ Lighthouse Scores', 'Zero Dependency Bloat', 'Tailored UX/UI Precision']
  },
  {
    number: '04',
    icon: KeyRound,
    title: '100% Repository & IP Ownership',
    desc: 'You own the codebase from Day 1. Full IP transfer contracts assign all repositories, deployment keys, database access, and documentation to your team.',
    highlights: ['Zero License Lock-in', 'GitHub Repo Transfer', 'CI/CD Deployment Keys']
  },
  {
    number: '05',
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    desc: 'We follow industry security standards, implementing secure JWT authentication, OAuth2, role-based access control, and end-to-end data encryption.',
    highlights: ['OWASP Top 10 Compliant', 'Role-Based Access Control', 'Encrypted REST & GraphQL APIs']
  },
  {
    number: '06',
    icon: Zap,
    title: 'Automated CI/CD DevOps',
    desc: 'Deploy with confidence. We configure automated testing, Docker containers, and staging environments to ensure safe, zero-downtime updates.',
    highlights: ['Docker Containerization', 'Automated Staging Pipelines', 'GitHub Actions Integration']
  }
];

export default function WhyChooseUs() {
  return (
    <section className="why-us section">
      <div className="container">
        <div className="section-header">
          <div className="section-subtitle font-semibold">Our Differentiators</div>
          <h2 className="h2 section-header__title">Ownable Standards We Live By</h2>
          <p className="section-header__desc">
            We don't offer generic promises. Here are the core technical standards we guarantee on every project.
          </p>
        </div>

        <div className="why-us__grid">
          {DIFFERENTIATORS.map((diff) => {
            const IconComponent = diff.icon;
            return (
              <div key={diff.number} className="why-us__card">
                <div className="why-us__card-header-row">
                  <div className="why-us__card-icon-wrapper">
                    <IconComponent className="why-us__card-icon" size={20} />
                  </div>
                  <div className="why-us__card-number">{diff.number}</div>
                </div>
                <h3 className="h4 why-us__card-title">{diff.title}</h3>
                <p className="why-us__card-desc">{diff.desc}</p>
                
                <ul className="why-us__card-highlights">
                  {diff.highlights.map((highlight, index) => (
                    <li key={index} className="why-us__card-highlight">
                      <span className="why-us__highlight-bullet">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

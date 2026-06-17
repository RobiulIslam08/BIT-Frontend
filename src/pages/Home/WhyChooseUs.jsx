// ============================================
// BIT SOFTWARE — Why Choose Us (Ownable Differentiators)
// ============================================

import './Home.css';

const DIFFERENTIATORS = [
  {
    number: '01',
    title: 'ZATCA Phase-2 Registered Developer',
    desc: 'Our ERP & billing engines are certified and integrated directly with ZATCA Phase-2 sandbox APIs, ensuring seamless e-invoicing for Saudi compliance.'
  },
  {
    number: '02',
    title: 'SLA-Backed In-House Engineering',
    desc: 'We do not outsource to external contractors. Every developer is an in-house full-time team member in Saudi Arabia, providing SLA response times under 4 hours.'
  },
  {
    number: '03',
    title: 'Zero-Template Bespoke Codebases',
    desc: 'No bloated page builders, pre-made themes, or template code. We construct custom React, Next.js, and Node architectures targeting a 90+ Lighthouse score.'
  },
  {
    number: '04',
    title: '100% IP & Repository Ownership',
    desc: 'Full IP assignment contracts from Day 1. Your company owns the entire custom source code repository, deployment keys, and databases with zero licensing lock-in.'
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
          {DIFFERENTIATORS.map((diff) => (
            <div key={diff.number} className="why-us__card">
              <div className="why-us__card-number">{diff.number}</div>
              <h3 className="h4 why-us__card-title">{diff.title}</h3>
              <p className="why-us__card-desc">{diff.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

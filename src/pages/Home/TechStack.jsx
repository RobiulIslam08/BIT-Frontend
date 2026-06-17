// ============================================
// BIT SOFTWARE — Tech Stack (Floating Logo Cloud)
// ============================================

import { useEffect, useRef } from 'react';
import './Home.css';

const TECHS = [
  { name: 'React', color: '#61DAFB', svg: `<svg viewBox="0 0 32 32"><circle cx="16" cy="15.97" r="2.6" fill="currentColor"/><ellipse cx="16" cy="15.97" rx="11.5" ry="4.35" fill="none" stroke="currentColor" stroke-width="1.3"/><ellipse cx="16" cy="15.97" rx="11.5" ry="4.35" fill="none" stroke="currentColor" stroke-width="1.3" transform="rotate(60 16 15.97)"/><ellipse cx="16" cy="15.97" rx="11.5" ry="4.35" fill="none" stroke="currentColor" stroke-width="1.3" transform="rotate(120 16 15.97)"/></svg>` },
  { name: 'Vue.js', color: '#4FC08D', svg: `<svg viewBox="0 0 32 32"><path d="M19.5 4H25L16 20 7 4h5.5L16 10l3.5-6z" fill="currentColor"/><path d="M7 4l9 16L25 4h-5.5L16 10l-3.5-6H7z" fill="currentColor" opacity=".6"/></svg>` },
  { name: 'Next.js', color: '#ffffff', svg: `<svg viewBox="0 0 32 32"><path d="M16 2a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm5.9 21.3L13 11.5v9.2h1.5V14l7.2 9.8a14 14 0 0 1-5.7 1.2A11.5 11.5 0 1 1 27 13.3v1.3h1.5v-1.3A13 13 0 0 0 16 2z" fill="currentColor"/></svg>` },
  { name: 'Node.js', color: '#339933', svg: `<svg viewBox="0 0 32 32"><path d="M16 2.1L3.5 9.3v14.4L16 30.9l12.5-7.2V9.3L16 2.1zm0 2.3l10 5.8v11.6l-10 5.8-10-5.8V10.2l10-5.8z" fill="currentColor"/><path d="M16 10v12l8-4V14l-8-4z" fill="currentColor" opacity=".5"/></svg>` },
  { name: 'Laravel', color: '#FF2D20', svg: `<svg viewBox="0 0 32 32"><path d="M5.4 8c-.2 0-.4.2-.4.4v9.2c0 .2.1.3.2.4l7.8 4.5c.1.1.3.1.4 0l7.8-4.5c.1-.1.2-.2.2-.4V8.4c0-.2-.2-.4-.4-.4-.1 0-.2 0-.2.1l-7.6 4.4c-.1.1-.3.1-.4 0L5.6 8.1c-.1-.1-.1-.1-.2-.1zm16 .5c-.2 0-.4.2-.4.4v5.8l-3.8-2.2c-.1-.1-.3-.1-.4 0L13 14.7c-.1.1-.2.2-.2.4v4.5c0 .2.1.3.2.4l3.8 2.2c.1.1.3.1.4 0l3.8-2.2c.1-.1.2-.2.2-.4V9c0-.2-.1-.4-.3-.5h-.2z" fill="currentColor"/></svg>` },
  { name: 'Python', color: '#3776AB', svg: `<svg viewBox="0 0 32 32"><path d="M15.9 3C9.6 3 10 5.9 10 5.9v3h6.1v.9H6.5S3 9.3 3 16s2.8 6.4 2.8 6.4h2.3v-3.1s-.1-3.3 3-3.3h5.2s2.8.1 2.8-2.7V7.1S19.5 3 15.9 3zm-3 2.3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/><path d="M16.1 29c6.3 0 5.9-2.9 5.9-2.9v-3H15.9v-.9h9.6S29 22.7 29 16s-2.8-6.4-2.8-6.4h-2.3v3.1s.1 3.3-3 3.3h-5.2s-2.8-.1-2.8 2.7v6.2S12.5 29 16.1 29zm3-2.3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>` },
  { name: 'Flutter', color: '#02569B', svg: `<svg viewBox="0 0 32 32"><path d="M18.5 3L5 16.5l4.2 4.2L26.5 3h-8zm0 13L13 21.5l4.2 4.2L18.5 27h8l-5.5-5.5 5.5-5.5h-8z" fill="currentColor"/></svg>` },
  { name: 'RN', color: '#61DAFB', svg: `<svg viewBox="0 0 32 32"><rect x="10" y="4" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="1.8" fill="currentColor"/><ellipse cx="16" cy="16" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="1"/><ellipse cx="16" cy="16" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="7" ry="2.8" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(120 16 16)"/></svg>` },
  { name: 'Tailwind', color: '#06B6D4', svg: `<svg viewBox="0 0 32 32"><path d="M16 8c-4 0-6.5 2-7.5 6 1.5-2 3.3-2.8 5.3-2.2 1.1.3 1.9 1.2 2.8 2.1C18.2 15.5 20 17 24 17c4 0 6.5-2 7.5-6-1.5 2-3.3 2.8-5.3 2.2-1.1-.3-1.9-1.2-2.8-2.1C21.8 9.5 20 8 16 8zM8 17c-4 0-6.5 2-7.5 6 1.5-2 3.3-2.8 5.3-2.2 1.1.3 1.9 1.2 2.8 2.1C10.2 24.5 12 26 16 26c4 0 6.5-2 7.5-6-1.5 2-3.3 2.8-5.3 2.2-1.1-.3-1.9-1.2-2.8-2.1C13.8 18.5 12 17 8 17z" fill="currentColor"/></svg>` },
  { name: 'MySQL', color: '#4479A1', svg: `<svg viewBox="0 0 32 32"><ellipse cx="16" cy="8" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 16c0 2.2 4.5 4 10 4s10-1.8 10-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>` },
  { name: 'MongoDB', color: '#47A248', svg: `<svg viewBox="0 0 32 32"><path d="M16.2 3s-5.3 4.8-5.3 12.2c0 5.6 3.6 10.2 5 11.6l.3 2.2h1l.2-2.2c1.4-1.4 5-6 5-11.6C22.4 7.8 16.2 3 16.2 3z" fill="currentColor"/></svg>` },
  { name: 'Postgres', color: '#4169E1', svg: `<svg viewBox="0 0 32 32"><path d="M23 5c-2-1.5-5-2-7-2s-5 .5-7 2c-3 2-4 6-4 10s1 7 4 9c2 1.5 4 2 7 2s5-.5 7-2c3-2 4-5 4-9s-1-8-4-10z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13 12v8M19 12v8M10 16h12" stroke="currentColor" stroke-width="1.2"/></svg>` },
  { name: 'Firebase', color: '#FFCA28', svg: `<svg viewBox="0 0 32 32"><path d="M6 26l2.3-15.2.1-.5L12 18l4-16 4 10 6 14H6z" fill="currentColor"/><path d="M6 26l6.4-4L8.3 10.3 6 26z" fill="currentColor" opacity=".6"/></svg>` },
  { name: 'AWS', color: '#FF9900', svg: `<svg viewBox="0 0 32 32"><path d="M8 18.5c0 .5.2 1 .5 1.3l5 4c.3.2.7.2 1 0l5-4c.3-.3.5-.8.5-1.3v-5c0-.5-.2-1-.5-1.3l-5-4c-.3-.2-.7-.2-1 0l-5 4c-.3.3-.5.8-.5 1.3v5z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 22v4M20 22v4M8 24h16" stroke="currentColor" stroke-width="1.5"/></svg>` },
  { name: 'Docker', color: '#2496ED', svg: `<svg viewBox="0 0 32 32"><rect x="14" y="4" width="4" height="4" rx=".5" fill="currentColor"/><rect x="14" y="9" width="4" height="4" rx=".5" fill="currentColor"/><rect x="14" y="14" width="4" height="4" rx=".5" fill="currentColor"/><rect x="9" y="14" width="4" height="4" rx=".5" fill="currentColor"/><rect x="4" y="14" width="4" height="4" rx=".5" fill="currentColor"/><rect x="19" y="14" width="4" height="4" rx=".5" fill="currentColor"/><rect x="9" y="9" width="4" height="4" rx=".5" fill="currentColor"/><path d="M2 19c1 4 5 7 11 7s12-3 14-7H2z" fill="currentColor" opacity=".4"/></svg>` },
  { name: 'WP', color: '#21759B', svg: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 16l6 11M16 5l4 15-5 7M22 8l4 14H17" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>` },
  { name: 'Figma', color: '#F24E1E', svg: `<svg viewBox="0 0 32 32"><circle cx="19" cy="16" r="4" fill="currentColor" opacity=".7"/><rect x="9" y="4" width="8" height="8" rx="4" fill="currentColor"/><rect x="9" y="12" width="8" height="8" rx="4" fill="currentColor" opacity=".8"/><rect x="9" y="20" width="8" height="8" rx="4" fill="currentColor" opacity=".6"/><rect x="17" y="4" width="8" height="8" rx="4" fill="currentColor" opacity=".5"/></svg>` },
  { name: 'Ps', color: '#31A8FF', svg: `<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.5"/><text x="9" y="22" font-size="13" font-weight="bold" fill="currentColor" font-family="sans-serif">Ps</text></svg>` },
  { name: 'Ai', color: '#FF9A00', svg: `<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.5"/><text x="10" y="22" font-size="13" font-weight="bold" fill="currentColor" font-family="sans-serif">Ai</text></svg>` },
  { name: 'G. Ads', color: '#4285F4', svg: `<svg viewBox="0 0 32 32"><circle cx="16" cy="24" r="4" fill="currentColor" opacity=".6"/><path d="M8 6l8 18M24 6l-8 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { name: 'Git', color: '#F05032', svg: `<svg viewBox="0 0 32 32"><path d="M29 14.6L17.4 3a1.4 1.4 0 0 0-2 0L13 5.5l2.5 2.5a1.7 1.7 0 0 1 2.2 2.2l2.4 2.4a1.7 1.7 0 1 1-1 1l-2.3-2.3v6a1.7 1.7 0 1 1-1.4-.2v-6.1a1.7 1.7 0 0 1-.9-2.3L12 6.2 3 15.2a1.4 1.4 0 0 0 0 2L14.6 29a1.4 1.4 0 0 0 2 0L29 16.6a1.4 1.4 0 0 0 0-2z" fill="currentColor"/></svg>` },
  { name: 'TS', color: '#3178C6', svg: `<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.5"/><text x="8" y="22" font-size="12" font-weight="bold" fill="currentColor" font-family="sans-serif">TS</text></svg>` },
  { name: 'JS', color: '#F7DF1E', svg: `<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.5"/><text x="9" y="22" font-size="12" font-weight="bold" fill="currentColor" font-family="sans-serif">JS</text></svg>` },
  { name: 'Linux', color: '#FCC624', svg: `<svg viewBox="0 0 32 32"><path d="M16 4c-3 0-5 3-5 7v5c-2 1-4 3-4 5 0 1 1 2 3 3h12c2-1 3-2 3-3 0-2-2-4-4-5v-5c0-4-2-7-5-7z" fill="currentColor"/><circle cx="13.5" cy="12" r="1" fill="var(--color-bg)"/><circle cx="18.5" cy="12" r="1" fill="var(--color-bg)"/><path d="M13 16c1.5 1 3.5 1 5 0" fill="none" stroke="var(--color-bg)" stroke-width="1" stroke-linecap="round"/></svg>` },
  { name: 'cPanel', color: '#FF6C2C', svg: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 16a5 5 0 0 1 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="16" r="2" fill="currentColor"/></svg>` },
];

// Seeded random for consistent float positions
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function TechStack() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('.tech-float__item');
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      items.forEach((item, i) => {
        const depth = 0.5 + seededRandom(i * 7) * 0.5;
        const moveX = x * 20 * depth;
        const moveY = y * 20 * depth;
        item.style.setProperty('--parallax-x', `${moveX}px`);
        item.style.setProperty('--parallax-y', `${moveY}px`);
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="tech-stack section-sm">
      <div className="container">
        <div className="tech-stack__inner">
          <div className="tech-stack__label">Our Engineering Core</div>
          <p className="tech-stack__subtitle">Technologies we use to build world-class solutions</p>
          <div className="tech-float" ref={containerRef}>
            {TECHS.map((tech, i) => {
              const delay = seededRandom(i * 3) * 6;
              const duration = 4 + seededRandom(i * 5) * 4;
              const size = 64 + seededRandom(i * 11) * 16;
              return (
                <div
                  key={tech.name}
                  className="tech-float__item"
                  style={{
                    '--float-delay': `${delay}s`,
                    '--float-duration': `${duration}s`,
                    '--tech-color': tech.color,
                    '--item-size': `${size}px`,
                  }}
                  title={tech.name}
                >
                  <div
                    className="tech-float__icon"
                    dangerouslySetInnerHTML={{ __html: tech.svg }}
                  />
                  <span className="tech-float__name">{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

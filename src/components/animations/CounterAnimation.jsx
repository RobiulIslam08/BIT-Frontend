// ============================================
// BIT SOFTWARE — Counter Animation (Scroll-Triggered)
// Numbers count up when entering viewport
// ============================================

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'motion/react';

export function Counter({ to, suffix = '', prefix = '', duration = 2000 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const target = typeof to === 'number' ? to : parseFloat(to);
    const isFloat = !Number.isInteger(target);
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}{isInView ? count.toLocaleString() : '0'}{suffix}
    </span>
  );
}

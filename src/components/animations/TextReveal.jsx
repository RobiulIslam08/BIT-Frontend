// ============================================
// BIT SOFTWARE — TextReveal Animation
// ============================================

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export function TextReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} style={{ overflow: 'hidden' }} className={className}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={isInView ? { y: '0%', opacity: 1 } : { y: '100%', opacity: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.0, 0.0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

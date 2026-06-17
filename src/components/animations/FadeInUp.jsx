// ============================================
// BIT SOFTWARE — FadeInUp (Scroll-Triggered)
// Sections animate IN as they enter viewport
// ============================================

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export function FadeInUp({ children, delay = 0, className = '', distance = 40, once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

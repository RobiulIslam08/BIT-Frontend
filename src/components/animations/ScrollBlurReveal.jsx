// ============================================
// BIT SOFTWARE — ScrollBlurReveal Component
// Animates section opacity, blur, and y-offset
// respects prefers-reduced-motion
// ============================================

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

export function ScrollBlurReveal({ children, className = '', id }) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  // Trigger once when the element is 15% inside the viewport
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, filter: 'blur(14px)', y: 24 }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : { opacity: 0, filter: 'blur(14px)', y: 24 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo / smooth ease-out
      }}
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.section>
  );
}

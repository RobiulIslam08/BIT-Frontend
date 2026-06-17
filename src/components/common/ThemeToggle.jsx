// ============================================
// BIT SOFTWARE — ThemeToggle Component
// ============================================

import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme } from '@/features/theme/themeSlice';

export function ThemeToggle({ className = '' }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isDark = mode === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`btn-icon ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position: 'relative',
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 180 : 0,
          scale: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'absolute' }}
      >
        <Sun size={18} style={{ color: 'var(--color-text-primary)' }} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : -180,
          scale: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'absolute' }}
      >
        <Moon size={18} style={{ color: 'var(--color-text-primary)' }} />
      </motion.div>
    </button>
  );
}

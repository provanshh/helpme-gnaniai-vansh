import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

interface SOSButtonProps {
  onActivate?: () => void;
  className?: string;
  size?: 'md' | 'lg';
  label?: string;
}

export function SOSButton({ onActivate, className, size = 'lg', label }: SOSButtonProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const dim = size === 'lg' ? 80 : 64;

  return (
    <button
      type="button"
      aria-label={t('sos.aria')}
      onClick={onActivate}
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: dim + 24, height: dim + 24 }}
    >
      {!reduce && (
        <>
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-sos/20"
            animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.15, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-2 rounded-full bg-sos/15"
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
          />
        </>
      )}
      <motion.span
        whileTap={{ scale: 0.94 }}
        className="relative z-10 flex flex-col items-center justify-center rounded-full bg-sos text-on-sos shadow-[var(--shadow-sos)]"
        style={{ width: dim, height: dim }}
      >
        <Icon name="siren" size={size === 'lg' ? 32 : 26} strokeWidth={2} />
        <span className="mt-0.5 text-[11px] font-bold tracking-widest">
          {label ?? t('sos.short')}
        </span>
      </motion.span>
    </button>
  );
}

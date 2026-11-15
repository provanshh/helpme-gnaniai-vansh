import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'danger' | 'ghost' | 'secondary' | 'outline';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  icon?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-[var(--shadow-card)] hover:bg-primary-dark active:bg-primary-dark',
  danger: 'bg-sos text-on-sos shadow-[var(--shadow-sos)] hover:bg-sos-dark',
  secondary: 'bg-surface-low text-text hover:bg-surface-mid',
  outline: 'bg-surface text-primary border-[1.5px] border-primary hover:bg-primary-soft',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-low hover:text-text',
};

export function Button({
  variant = 'primary',
  icon,
  fullWidth,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-3 font-[family-name:var(--font-sans)] text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </motion.button>
  );
}

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

interface FilterChipProps {
  label: string;
  icon?: IconName;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, icon, active, onClick }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold shadow-sm transition-colors',
        active ? 'bg-primary text-on-primary' : 'glass text-text hover:bg-surface',
      )}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      {label}
    </motion.button>
  );
}

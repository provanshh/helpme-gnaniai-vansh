import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof GROUPS)[number];

interface BloodGroupGridProps {
  value?: BloodGroup | null;
  onChange?: (group: BloodGroup) => void;
}

export function BloodGroupGrid({ value, onChange }: BloodGroupGridProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Blood group">
      {GROUPS.map((g) => {
        const active = value === g;
        return (
          <motion.button
            key={g}
            type="button"
            role="radio"
            aria-checked={active}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange?.(g)}
            className={cn(
              'min-h-10 rounded-xl text-sm font-bold shadow-[var(--shadow-card)] transition-colors',
              active
                ? 'bg-sos text-on-sos shadow-[var(--shadow-sos)]'
                : 'bg-surface text-text hover:bg-sos-soft',
            )}
          >
            {g}
          </motion.button>
        );
      })}
    </div>
  );
}

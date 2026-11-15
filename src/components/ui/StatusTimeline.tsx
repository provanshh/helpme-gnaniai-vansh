import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export interface TimelineStep {
  id: string;
  label: string;
  done?: boolean;
  active?: boolean;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-2.5 pb-3.5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                'absolute left-[11px] top-7 h-[calc(100%-16px)] w-0.5',
                step.done ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className={cn(
              'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold',
              step.done && 'border-primary bg-primary text-on-primary',
              step.active && !step.done && 'border-primary bg-primary-soft text-primary',
              !step.done && !step.active && 'border-border bg-surface text-text-secondary',
            )}
          >
            {step.done ? <Icon name="check" size={12} strokeWidth={2.25} /> : i + 1}
          </motion.span>
          <span
            className={cn(
              'pt-0.5 text-[13px] font-semibold',
              step.active || step.done ? 'text-text' : 'text-text-secondary',
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

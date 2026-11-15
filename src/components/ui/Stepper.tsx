import { cn } from '@/lib/cn';

interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center gap-2" role="list" aria-label="Progress">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={label} className="flex flex-1 flex-col gap-1" role="listitem">
            <div
              className={cn(
                'h-1.5 rounded-full transition-colors',
                done || active ? 'bg-primary' : 'bg-border',
              )}
            />
            <span
              className={cn(
                'text-[11px] font-semibold',
                active ? 'text-primary' : 'text-text-secondary',
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

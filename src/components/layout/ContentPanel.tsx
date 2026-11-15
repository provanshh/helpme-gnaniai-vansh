import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContentPanelProps {
  children: ReactNode;
  className?: string;
}

export function ContentPanel({ children, className }: ContentPanelProps) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-y-auto bg-bg lg:w-1/2 lg:border-r lg:border-border lg:bg-surface lg:px-3 lg:py-2',
        className,
      )}
    >
      {children}
    </section>
  );
}

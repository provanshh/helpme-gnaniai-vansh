import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/appStore';
import { Icon } from './Icon';

interface LocationChipProps {
  className?: string;
  compact?: boolean;
}

export function LocationChip({ className, compact }: LocationChipProps) {
  const locationLabel = useAppStore((s) => s.locationLabel);
  const gpsActive = useAppStore((s) => s.gpsActive);

  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-9 max-w-[160px] items-center gap-1 rounded-full bg-surface-low px-2 text-left transition-colors hover:bg-surface-mid',
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        {gpsActive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Icon name="mapPin" size={13} className="text-primary" />
      <span className="truncate text-xs font-semibold text-text">
        {compact ? locationLabel.split(',')[0] : locationLabel}
      </span>
    </button>
  );
}

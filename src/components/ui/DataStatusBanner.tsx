import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

interface DataStatusBannerProps {
  offline?: boolean;
  refreshing?: boolean;
  widened?: boolean;
  message?: string | null;
  className?: string;
}

export function DataStatusBanner({
  offline,
  refreshing,
  widened,
  message,
  className,
}: DataStatusBannerProps) {
  const { t } = useTranslation();
  if (!offline && !refreshing && !widened && !message) return null;

  const text =
    message ||
    (offline
      ? t('places.offlineBanner')
      : refreshing
        ? t('places.findingHelp')
        : widened
          ? t('places.widened')
          : null);

  if (!text) return null;

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold shadow-[var(--shadow-card)]',
        offline ? 'bg-sos-soft text-sos' : 'bg-primary-soft text-primary',
        className,
      )}
    >
      <Icon name={offline ? 'alertTriangle' : 'activity'} size={14} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

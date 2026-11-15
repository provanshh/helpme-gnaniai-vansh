import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title?: string;
  description?: string;
}

export function EmptyState({
  icon = 'search',
  title,
  description,
}: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-low text-primary">
        <Icon name={icon} size={20} />
      </span>
      <h3 className="font-[family-name:var(--font-sans)] text-sm font-semibold text-text">
        {title ?? t('common.emptyTitle')}
      </h3>
      <p className="max-w-xs text-[12px] leading-snug text-text-secondary">
        {description ?? t('common.emptyDescription')}
      </p>
    </div>
  );
}

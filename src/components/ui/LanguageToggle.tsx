import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/appStore';
import { Icon } from './Icon';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export function LanguageToggle({ className, compact }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);

  const next = i18n.language?.startsWith('hi') ? 'en' : 'hi';

  return (
    <button
      type="button"
      aria-label={t('nav.changeLanguage')}
      onClick={() => setLanguage(next)}
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-1 rounded-full bg-surface-low px-2 text-xs font-semibold text-text transition-colors hover:bg-surface-mid',
        compact && 'min-w-9 px-1.5',
        className,
      )}
    >
      <Icon name="languages" size={15} className="text-text-secondary" />
      {!compact && <span>{i18n.language?.startsWith('hi') ? 'हिं / EN' : 'EN / हिं'}</span>}
    </button>
  );
}

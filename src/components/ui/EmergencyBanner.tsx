import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';

export function EmergencyBanner() {
  const { t } = useTranslation();
  return (
    <a
      href="tel:112"
      className="flex min-h-9 items-center justify-between gap-2 rounded-xl bg-sos-soft/70 px-2.5 py-1.5 text-xs font-semibold text-sos"
    >
      <span className="inline-flex items-center gap-1.5">
        <Icon name="shieldAlert" size={14} />
        {t('common.call112')}
      </span>
      <span className="tabular-nums font-bold">112</span>
    </a>
  );
}

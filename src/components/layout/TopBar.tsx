import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon, LanguageToggle, LocationChip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const nav = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/map', labelKey: 'nav.map' },
  { to: '/requests', labelKey: 'nav.requests', badge: 3 },
  { to: '/profile', labelKey: 'nav.profile' },
] as const;

export function TopBar() {
  const { t } = useTranslation();
  const desktop = useIsDesktop();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-surface/90 pt-safe shadow-[0_1px_8px_rgb(26_36_51/0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-2 px-3 lg:px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
            <Icon name="heartPulse" size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col">
            <span className="font-[family-name:var(--font-sans)] text-sm font-semibold leading-tight text-text">
              {t('brand.name')}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              {desktop ? t('brand.tagline') : t('sos.short')}
            </span>
          </span>
        </Link>

        {desktop && (
          <nav className="flex items-center gap-1 rounded-[var(--radius-lg)] bg-surface-low p-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-container text-on-primary'
                      : 'text-text-secondary hover:text-text',
                  )
                }
              >
                {t(item.labelKey)}
                {'badge' in item && item.badge ? (
                  <span className="ml-1 rounded-full bg-sos px-1.5 py-0.5 text-[10px] text-on-sos">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1.5">
          <LocationChip compact={!desktop} className={desktop ? '' : 'max-w-[100px]'} />
          <LanguageToggle compact={!desktop} />
          <Link
            to="/sos"
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-sos px-2.5 text-xs font-bold text-on-sos shadow-[var(--shadow-sos)] transition-transform active:scale-95"
          >
            <Icon name="siren" size={15} />
            <span>112</span>
          </Link>
          {desktop && (
            <Link
              to="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary"
              aria-label={t('nav.profile')}
            >
              <Icon name="user" size={16} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

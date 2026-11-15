import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataStatusBanner, EmergencyBanner, Icon, ServiceCard, SOSButton } from '@/components/ui';
import { staggerContainer } from '@/lib/motion';
import { placesService } from '@/services/placesService';
import { useAppStore, type ServiceFilter } from '@/store/appStore';

const services: {
  filter: ServiceFilter;
  route: string;
  titleKey: string;
  subKey: string;
  icon: 'ambulance' | 'hospital' | 'droplet' | 'stethoscope' | 'pill' | 'activity';
  tone: 'sos' | 'teal' | 'mint' | 'slate';
}[] = [
  {
    filter: 'ambulance',
    route: '/ambulance',
    titleKey: 'services.ambulance',
    subKey: 'services.ambulanceSub',
    icon: 'ambulance',
    tone: 'sos',
  },
  {
    filter: 'hospital',
    route: '/hospitals',
    titleKey: 'services.hospitals',
    subKey: 'services.hospitalsSub',
    icon: 'hospital',
    tone: 'teal',
  },
  {
    filter: 'blood_bank',
    route: '/blood',
    titleKey: 'services.blood',
    subKey: 'services.bloodSub',
    icon: 'droplet',
    tone: 'sos',
  },
  {
    filter: 'clinic',
    route: '/doctors',
    titleKey: 'services.doctors',
    subKey: 'services.doctorsSub',
    icon: 'stethoscope',
    tone: 'slate',
  },
  {
    filter: 'pharmacy',
    route: '/pharmacy',
    titleKey: 'services.pharmacy',
    subKey: 'services.pharmacySub',
    icon: 'pill',
    tone: 'mint',
  },
  {
    filter: 'ai',
    route: '/voice',
    titleKey: 'services.ai',
    subKey: 'services.aiSub',
    icon: 'activity',
    tone: 'teal',
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const coords = useAppStore((s) => s.coords);
  const setPlaces = useAppStore((s) => s.setPlaces);
  const setActiveFilters = useAppStore((s) => s.setActiveFilters);
  const activeFilters = useAppStore((s) => s.activeFilters);
  const locationLabel = useAppStore((s) => s.locationLabel);
  const gpsAccuracyM = useAppStore((s) => s.gpsAccuracyM);
  const placesMeta = useAppStore((s) => s.placesMeta);

  useEffect(() => {
    void placesService.searchWithMeta({ near: coords, kind: 'all' }).then(({ places, meta }) => {
      setPlaces(places, meta);
    });
  }, [coords, setPlaces]);

  return (
    <div className="flex flex-col gap-3 pb-3">
      <EmergencyBanner />
      <DataStatusBanner
        offline={placesMeta?.offline}
        refreshing={placesMeta?.refreshing && !placesMeta?.offline}
        widened={placesMeta?.widened}
        message={placesMeta?.message}
      />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {t('home.eyebrow')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-low px-2 py-0.5 text-[10px] font-semibold text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {t('home.gpsLive')}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-sans)] text-base font-bold leading-tight tracking-tight text-text lg:text-lg">
          {t('home.title')}
        </h1>
        <div className="mt-1 inline-flex items-center gap-1.5 self-start rounded-lg bg-surface px-2.5 py-1.5 shadow-[var(--shadow-card)] lg:bg-surface-low">
          <Icon name="locateFixed" size={14} className="text-primary" />
          <span>
            <span className="block text-xs font-semibold leading-tight">{locationLabel}</span>
            <span className="text-[10px] text-text-secondary">
              {gpsAccuracyM != null ? `Accuracy ± ${gpsAccuracyM}m` : t('home.gpsPending')}
            </span>
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-surface p-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-row items-center gap-3">
          <SOSButton size="md" onActivate={() => navigate('/sos')} />
          <div className="min-w-0 text-left">
            <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
              <span className="font-[family-name:var(--font-sans)] text-[13px] font-bold tracking-tight text-sos">
                {t('home.sosTitle')}
              </span>
              <span className="rounded-full bg-sos-soft px-1.5 py-0.5 text-[9px] font-bold text-sos">
                {t('home.sosBadge')}
              </span>
            </div>
            <p className="text-[11px] leading-snug text-text-secondary line-clamp-2">
              {t('home.sosBody')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <h2 className="font-[family-name:var(--font-sans)] text-[12px] font-semibold">
            {t('home.services')}
          </h2>
          <span className="text-[10px] text-text-secondary">{t('home.servicesHint')}</span>
        </div>
        <motion.div
          className="grid grid-cols-3 gap-1.5"
          variants={reduce ? undefined : staggerContainer}
          initial="initial"
          animate="animate"
        >
          {services.map((s, i) => (
            <ServiceCard
              key={s.filter}
              index={i}
              title={t(s.titleKey)}
              subtitle={t(s.subKey)}
              icon={s.icon}
              tone={s.tone}
              active={
                s.filter !== 'ai' &&
                activeFilters.includes(s.filter) &&
                !activeFilters.includes('all')
              }
              onClick={() => {
                if (s.filter === 'ai') {
                  navigate(s.route);
                  return;
                }
                setActiveFilters([s.filter]);
                navigate(s.route);
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="rounded-xl bg-surface-low p-2">
        <div className="mb-1.5 px-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            {t('home.emergencyLines')}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { n: '112', label: 'National' },
            { n: '102', label: 'Ambulance' },
            { n: '108', label: 'Disaster' },
          ].map((line) => (
            <a
              key={line.n}
              href={`tel:${line.n}`}
              className="flex min-h-10 items-center justify-center gap-1 rounded-lg bg-surface px-1.5 shadow-[var(--shadow-card)] transition-colors hover:bg-surface-mid"
            >
              <Icon name="phone" size={14} className={line.n === '112' ? 'text-sos' : 'text-primary'} />
              <span className="text-left">
                <span className="block text-xs font-bold leading-none">{line.n}</span>
                <span className="text-[9px] text-text-secondary">{line.label}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <Link
        to="/donor/register"
        className="flex min-h-9 items-center justify-between rounded-xl bg-primary-soft px-3 py-2 transition-transform active:scale-[0.99]"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="droplet" size={16} />
          </span>
          <span>
            <span className="block text-[12px] font-semibold text-text">{t('home.donorCta')}</span>
            <span className="text-[11px] text-text-secondary">{t('home.donorSub')}</span>
          </span>
        </span>
        <Icon name="chevronRight" size={16} className="text-primary" />
      </Link>
    </div>
  );
}

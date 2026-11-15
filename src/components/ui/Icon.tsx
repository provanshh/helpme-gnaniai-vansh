import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  BedDouble,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crosshair,
  Droplet,
  Filter,
  Globe,
  HeartPulse,
  Home,
  Hospital,
  Languages,
  Layers3,
  ListChecks,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Phone,
  Pill,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Stethoscope,
  User,
  UserRound,
  Users,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const icons = {
  activity: Activity,
  alertTriangle: AlertTriangle,
  ambulance: Ambulance,
  arrowLeft: ArrowLeft,
  bed: BedDouble,
  bell: Bell,
  building: Building2,
  check: Check,
  checkCircle: CheckCircle2,
  chevronRight: ChevronRight,
  clock: Clock,
  crosshair: Crosshair,
  droplet: Droplet,
  filter: Filter,
  globe: Globe,
  heartPulse: HeartPulse,
  home: Home,
  hospital: Hospital,
  languages: Languages,
  layers3: Layers3,
  listChecks: ListChecks,
  locateFixed: LocateFixed,
  map: MapIcon,
  mapPin: MapPin,
  message: MessageCircle,
  mic: Mic,
  navigation: Navigation,
  phone: Phone,
  pill: Pill,
  search: Search,
  settings: Settings,
  shieldAlert: ShieldAlert,
  shieldCheck: ShieldCheck,
  siren: Siren,
  stethoscope: Stethoscope,
  user: User,
  userRound: UserRound,
  users: Users,
  x: X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.75, ...props }: IconProps) {
  const Comp = icons[name];
  return (
    <Comp
      aria-hidden
      className={cn('shrink-0', className)}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

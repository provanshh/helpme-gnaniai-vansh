import type { LineString } from 'geojson';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type PlaceKind =
  | 'hospital'
  | 'clinic'
  | 'doctor'
  | 'pharmacy'
  | 'blood_bank'
  | 'donor'
  | 'ambulance'
  | 'ngo';

export type PlaceSource = 'osm' | 'mappls' | 'google' | 'import' | 'registered' | 'demo' | 'offline';

export type HospitalType = 'govt' | 'private';
export type AmbulanceType = 'govt' | 'private' | 'free';
export type AmbulanceLevel = 'basic' | 'icu' | 'free';

export type RequestStatus =
  | 'Searching'
  | 'Donor accepted'
  | 'On the way'
  | 'Handover'
  | 'Completed'
  | 'Cancelled';

export type RequestKind = 'blood' | 'ambulance' | 'sos';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BloodStock {
  'A+': number;
  'A-': number;
  'B+': number;
  'B-': number;
  'O+': number;
  'O-': number;
  'AB+': number;
  'AB-': number;
}

export interface AmbulanceProvider {
  id: string;
  provider: string;
  type: AmbulanceType;
  level: AmbulanceLevel;
  lat: number;
  lng: number;
  available: boolean;
  phone: string;
  hasLiveGps?: boolean;
  demo?: boolean;
}

export interface Donor {
  id: string;
  firstName: string;
  bloodGroup: BloodGroup;
  lat: number;
  lng: number;
  availableNow: boolean;
  lastDonationMonthsAgo: number;
  phone: string;
  demo?: boolean;
}

export interface SampleRequest {
  id: string;
  kind: RequestKind;
  status: RequestStatus;
  createdAt: string;
  bloodGroup?: BloodGroup;
  units?: number;
  donorId?: string;
  hospitalId?: string;
  ambulanceId?: string;
  etaMin?: number;
  handoverCode?: string;
}

export interface PlaceDataQuality {
  missingPhone: boolean;
  missingHours: boolean;
  missingAddress: boolean;
  approximateCoords?: boolean;
}

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMin?: number;
  /** Only true when known 24x7 — never guessed from missing hours */
  openNow?: boolean | null;
  phone?: string;
  openingHours?: string | null;
  tags?: string[];
  meta?: Record<string, string | number | boolean>;
  source?: PlaceSource;
  verified?: boolean;
  dataQuality?: PlaceDataQuality;
  demo?: boolean;
}

export interface PlacesSearchMeta {
  radiusM: number;
  widened: boolean;
  message: string | null;
  refreshing: boolean;
  offline?: boolean;
  attribution?: string;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: LineString;
}

export interface HospitalDashboardSample {
  hospitalId: string;
  stats: {
    activeRequests: number;
    bloodUnits: number;
    icuBedsFree: number;
    ambulancesFree: number;
  };
  incoming: Array<{
    id: string;
    need: string;
    distanceKm: number;
    etaMin: number;
    urgency: 'high' | 'medium' | 'low';
  }>;
}

export const DEFAULT_LOCATION: LatLng = { lat: 28.7383, lng: 77.0822 };
export const EMERGENCY_NUMBERS = { national: '112', ambulance: '102', disaster: '108' } as const;

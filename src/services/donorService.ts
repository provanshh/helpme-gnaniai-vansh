import { delay, haversineKm } from '@/lib/geo';
import type { BloodGroup, Donor, LatLng } from '@/types/domain';

export interface DonorMatch {
  id: string;
  firstName: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  eligible: boolean;
  availableNow: boolean;
  demo: true;
  /** Approximate only — never exact GPS */
  approxLat: number;
  approxLng: number;
}

export interface DonorService {
  listNearby(near: LatLng, group?: BloodGroup): Promise<DonorMatch[]>;
  getById(id: string): Promise<Donor | null>;
  register(input: {
    firstName: string;
    bloodGroup: BloodGroup;
    phone: string;
  }): Promise<{ ok: true; donorId: string }>;
}

const GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const FIRST_NAMES = [
  'Rahul',
  'Priya',
  'Amit',
  'Sneha',
  'Vikram',
  'Neha',
  'Arjun',
  'Pooja',
  'Karan',
  'Anjali',
  'Ravi',
  'Meera',
];

/** Deterministic PRNG from area key so the same city gets the same demo donors. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function areaSeed(near: LatLng): number {
  const key = `${near.lat.toFixed(2)},${near.lng.toFixed(2)}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Offset lat/lng by distanceKm at bearing degrees. */
function offset(near: LatLng, distanceKm: number, bearingDeg: number): LatLng {
  const R = 6371;
  const br = (bearingDeg * Math.PI) / 180;
  const lat1 = (near.lat * Math.PI) / 180;
  const lng1 = (near.lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(br),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(br) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2),
    );
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

function generateDemoDonors(near: LatLng): Donor[] {
  const rand = mulberry32(areaSeed(near));
  const donors: Donor[] = [];
  for (let i = 0; i < 12; i++) {
    const distanceKm = 0.5 + rand() * 5.5;
    const bearing = rand() * 360;
    const pos = offset(near, distanceKm, bearing);
    donors.push({
      id: `demo-donor-${areaSeed(near).toString(16)}-${i}`,
      firstName: FIRST_NAMES[i % FIRST_NAMES.length]!,
      bloodGroup: GROUPS[Math.floor(rand() * GROUPS.length)]!,
      lat: pos.lat,
      lng: pos.lng,
      availableNow: rand() > 0.2,
      lastDonationMonthsAgo: Math.floor(rand() * 14) + 1,
      phone: `+91 90000 ${String(10000 + i).slice(0, 5)}`,
      demo: true,
    });
  }
  return donors;
}

function toMatch(d: Donor, near: LatLng): DonorMatch {
  return {
    id: d.id,
    firstName: d.firstName,
    bloodGroup: d.bloodGroup,
    distanceKm: haversineKm(near, { lat: d.lat, lng: d.lng }),
    eligible: d.lastDonationMonthsAgo >= 3,
    availableNow: d.availableNow,
    demo: true,
    approxLat: Math.round(d.lat * 100) / 100,
    approxLng: Math.round(d.lng * 100) / 100,
  };
}

const cache = new Map<string, Donor[]>();

function donorsFor(near: LatLng): Donor[] {
  const key = `${near.lat.toFixed(2)},${near.lng.toFixed(2)}`;
  let list = cache.get(key);
  if (!list) {
    list = generateDemoDonors(near);
    cache.set(key, list);
  }
  return list;
}

export const demoDonorService: DonorService = {
  async listNearby(near, group) {
    await delay(80);
    return donorsFor(near)
      .map((d) => toMatch(d, near))
      .filter((d) => (group ? d.bloodGroup === group : true))
      .filter((d) => d.eligible && d.availableNow)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },
  async getById(id) {
    await delay(40);
    for (const list of cache.values()) {
      const found = list.find((d) => d.id === id);
      if (found) return found;
    }
    return null;
  },
  async register(input) {
    await delay(300);
    return { ok: true, donorId: `d-new-${input.phone.slice(-4)}` };
  },
};

export const donorService: DonorService = demoDonorService;

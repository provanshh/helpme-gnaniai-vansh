import { OFFLINE_PLACES_FIXTURE } from '@/data/offline/placesFixture';
import { apiFetch } from '@/lib/api';
import { estimateEtaMin, haversineKm } from '@/lib/geo';
import type { LatLng, Place, PlaceKind, PlacesSearchMeta } from '@/types/domain';
import { donorService } from './donorService';

export type { Place, PlaceKind };

export interface PlacesQuery {
  kind?: PlaceKind | 'all' | PlaceKind[];
  near: LatLng;
  q?: string;
  radiusM?: number;
  openNow?: boolean;
}

export interface PlacesSearchResult {
  places: Place[];
  meta: PlacesSearchMeta;
}

export interface PlacesService {
  search(query: PlacesQuery): Promise<Place[]>;
  searchWithMeta(query: PlacesQuery): Promise<PlacesSearchResult>;
  getById(id: string): Promise<Place | null>;
  reportWrongInfo(id: string, message: string): Promise<{ ok: boolean }>;
}

type ApiPlace = {
  id: string;
  name: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  open24x7: boolean | null;
  openNow: boolean | null;
  tags?: string[];
  source?: Place['source'];
  verified?: boolean;
  dataQuality?: Place['dataQuality'];
  distanceKm: number;
  distanceM?: number;
};

function mapApiPlace(p: ApiPlace): Place {
  const distanceKm = p.distanceKm ?? 0;
  return {
    id: p.id,
    name: p.name,
    kind: p.kind,
    address: p.address?.trim() || 'Address not listed',
    lat: p.lat,
    lng: p.lng,
    distanceKm,
    etaMin: estimateEtaMin(distanceKm),
    openNow: p.openNow,
    phone: p.phone ?? undefined,
    openingHours: p.openingHours,
    tags: p.tags,
    source: p.source,
    verified: p.verified,
    dataQuality: p.dataQuality,
    meta: {
      missingPhone: Boolean(p.dataQuality?.missingPhone ?? !p.phone),
      missingHours: Boolean(p.dataQuality?.missingHours ?? !p.openingHours),
    },
  };
}

function offlineSearch(query: PlacesQuery): PlacesSearchResult {
  const places = OFFLINE_PLACES_FIXTURE.map((p) => {
    const distanceKm = haversineKm(query.near, { lat: p.lat, lng: p.lng });
    return {
      ...p,
      distanceKm,
      etaMin: estimateEtaMin(distanceKm),
      source: 'offline' as const,
      demo: true,
    };
  });
  return {
    places,
    meta: {
      radiusM: query.radiusM ?? 5000,
      widened: false,
      message: 'Offline, showing limited data',
      refreshing: false,
      offline: true,
      attribution: '© OpenStreetMap contributors',
    },
  };
}

function kindParam(kind?: PlacesQuery['kind']): string {
  if (!kind || kind === 'all') return 'all';
  if (Array.isArray(kind)) return kind.filter((k) => k !== 'donor').join(',') || 'all';
  if (kind === 'donor') return 'all';
  return kind;
}

export const apiPlacesService: PlacesService = {
  async searchWithMeta(query) {
    const params = new URLSearchParams({
      lat: String(query.near.lat),
      lng: String(query.near.lng),
      kind: kindParam(query.kind),
    });
    if (query.q) params.set('q', query.q);
    if (query.radiusM) params.set('radius', String(query.radiusM));
    if (query.openNow) params.set('openNow', 'true');

    try {
      const res = await apiFetch(`/api/places?${params.toString()}`);
      if (!res.ok) throw new Error(`places ${res.status}`);
      const data = (await res.json()) as {
        places: ApiPlace[];
        meta: PlacesSearchMeta;
      };
      let places = data.places.map(mapApiPlace);

      // Donors are demo-seeded on the client — merge when requested
      if (
        !query.kind ||
        query.kind === 'all' ||
        query.kind === 'donor' ||
        (Array.isArray(query.kind) && query.kind.includes('donor'))
      ) {
        const donors = await donorService.listNearby(query.near);
        const donorPlaces: Place[] = donors.map((d) => ({
          id: d.id,
          name: `${d.firstName} · ${d.bloodGroup}`,
          kind: 'donor',
          address: 'Demo donor · approx. location',
          lat: d.approxLat,
          lng: d.approxLng,
          distanceKm: d.distanceKm,
          etaMin: estimateEtaMin(d.distanceKm),
          openNow: d.availableNow,
          tags: [d.bloodGroup, 'Demo donor'],
          source: 'demo',
          verified: false,
          demo: true,
          meta: { demo: true, bloodGroup: d.bloodGroup },
        }));
        if (query.kind === 'donor' || (Array.isArray(query.kind) && query.kind.length === 1 && query.kind[0] === 'donor')) {
          places = donorPlaces;
        } else if (Array.isArray(query.kind) && query.kind.includes('donor')) {
          places = [...places, ...donorPlaces];
        } else if (query.kind === 'all' || !query.kind) {
          places = [...places, ...donorPlaces];
        }
      }

      places.sort((a, b) => a.distanceKm - b.distanceKm);
      return { places, meta: data.meta };
    } catch {
      return offlineSearch(query);
    }
  },

  async search(query) {
    const { places } = await this.searchWithMeta(query);
    return places;
  },

  async getById(id) {
    try {
      const res = await apiFetch(`/api/places/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { place: ApiPlace };
      return mapApiPlace({ ...data.place, distanceKm: data.place.distanceKm ?? 0 });
    } catch {
      return null;
    }
  },

  async reportWrongInfo(id, message) {
    try {
      const res = await apiFetch(`/api/places/${encodeURIComponent(id)}/report`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },
};

export const placesService: PlacesService = apiPlacesService;

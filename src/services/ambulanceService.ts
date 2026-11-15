import { apiFetch } from '@/lib/api';
import { delay, haversineKm } from '@/lib/geo';
import { routingService } from '@/services/routingService';
import type { AmbulanceProvider, LatLng, RouteResult } from '@/types/domain';
import { placesService } from './placesService';

export interface AmbulanceMatch extends AmbulanceProvider {
  distanceKm: number;
}

export interface AmbulanceService {
  listNearby(near: LatLng): Promise<AmbulanceMatch[]>;
  requestNearest(near: LatLng): Promise<{
    ambulance: AmbulanceMatch;
    route: RouteResult;
    demo: boolean;
  }>;
}

function demoAmbulance(near: LatLng): AmbulanceMatch {
  return {
    id: 'demo-ambulance-1',
    provider: 'Demo ambulance (simulated GPS)',
    type: 'private',
    level: 'basic',
    lat: near.lat + 0.012,
    lng: near.lng + 0.008,
    available: true,
    phone: '',
    distanceKm: haversineKm(near, { lat: near.lat + 0.012, lng: near.lng + 0.008 }),
    hasLiveGps: false,
    demo: true,
  };
}

export const liveAmbulanceService: AmbulanceService = {
  async listNearby(near) {
    try {
      const res = await apiFetch(
        `/api/ambulances/nearby?lat=${near.lat}&lng=${near.lng}&radius=15000`,
      );
      if (res.ok) {
        const data = (await res.json()) as { ambulances: AmbulanceMatch[] };
        if (data.ambulances.length) return data.ambulances;
      }
    } catch {
      /* fall through to places */
    }

    const places = await placesService.search({ near, kind: 'ambulance' });
    if (places.length) {
      return places.map((p) => ({
        id: p.id,
        provider: p.name,
        type: 'private' as const,
        level: 'basic' as const,
        lat: p.lat,
        lng: p.lng,
        available: true,
        phone: p.phone ?? '',
        distanceKm: p.distanceKm,
        hasLiveGps: false,
        demo: false,
      }));
    }

    await delay(100);
    return [demoAmbulance(near)];
  },

  async requestNearest(near) {
    const list = await this.listNearby(near);
    const ambulance = list.find((a) => a.available) ?? list[0]!;
    const route = await routingService.getRoute(
      { lat: ambulance.lat, lng: ambulance.lng },
      near,
    );
    return { ambulance, route, demo: Boolean(ambulance.demo) };
  },
};

export const ambulanceService: AmbulanceService = liveAmbulanceService;

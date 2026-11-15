import type { LineString } from 'geojson';
import { estimateEtaMin, haversineKm, lineBetween } from '@/lib/geo';
import type { LatLng, RouteResult } from '@/types/domain';

export interface RoutingService {
  getRoute(from: LatLng, to: LatLng): Promise<RouteResult>;
}

async function mapboxDirections(from: LatLng, to: LatLng, token: string): Promise<RouteResult | null> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?geometries=geojson&overview=full&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    routes?: Array<{ distance: number; duration: number; geometry: LineString }>;
  };
  const route = data.routes?.[0];
  if (!route) return null;
  return {
    distanceKm: route.distance / 1000,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    geometry: route.geometry,
  };
}

function fallbackRoute(from: LatLng, to: LatLng): RouteResult {
  const distanceKm = haversineKm(from, to) * 1.25;
  return {
    distanceKm,
    durationMin: estimateEtaMin(distanceKm),
    geometry: lineBetween(from, to),
  };
}

export const routingService: RoutingService = {
  async getRoute(from, to) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (token) {
      try {
        const routed = await mapboxDirections(from, to, token);
        if (routed) return routed;
      } catch {
        /* fall through */
      }
    }
    return fallbackRoute(from, to);
  },
};

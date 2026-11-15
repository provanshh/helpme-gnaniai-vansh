import type { LineString } from 'geojson';
import type { LatLng } from '@/types/domain';

const R = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Rough urban driving ETA from straight-line km (demo fallback). */
export function estimateEtaMin(distanceKm: number, speedKmh = 22): number {
  return Math.max(2, Math.round((distanceKm / speedKmh) * 60));
}

export function lineBetween(a: LatLng, b: LatLng): LineString {
  return {
    type: 'LineString',
    coordinates: [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ],
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import type { Place } from '@/types/domain';

/**
 * Tiny offline fixture — used ONLY when API and cache are both unavailable.
 * Clearly labeled; never presented as real OSM data.
 */
export const OFFLINE_PLACES_FIXTURE: Omit<Place, 'distanceKm' | 'etaMin'>[] = [];

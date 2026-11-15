import type { DataQuality, PlaceKind, PlaceSource } from '../overpass/types.js';

export interface StoredPlace {
  id: string;
  source: PlaceSource;
  sourceId: string;
  kind: PlaceKind;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  open24x7: boolean | null;
  tags: string[];
  verified: boolean;
  dataQuality: DataQuality;
  lastSyncedAt: string;
  areaKey: string;
}

export interface PlaceSearchResult extends StoredPlace {
  distanceM: number;
}

export interface AreaSyncRow {
  areaKey: string;
  lat: number;
  lng: number;
  radiusM: number;
  lastSyncedAt: string;
  lastRequestedAt: string;
}

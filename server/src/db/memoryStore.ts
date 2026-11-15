import { randomUUID } from 'node:crypto';
import type { NormalizedPlace } from '../overpass/types.js';
import type { AreaSyncRow, PlaceSearchResult, StoredPlace } from './types.js';

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toStored(p: NormalizedPlace, areaKey: string): StoredPlace {
  return {
    id: `${p.source}:${p.sourceId}`,
    source: p.source,
    sourceId: p.sourceId,
    kind: p.kind,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    phone: p.phone,
    openingHours: p.openingHours,
    open24x7: p.open24x7,
    tags: p.tags,
    verified: p.verified,
    dataQuality: p.dataQuality,
    lastSyncedAt: new Date().toISOString(),
    areaKey,
  };
}

class MemoryStore {
  places = new Map<string, StoredPlace>();
  areas = new Map<string, AreaSyncRow>();
  registrations: Array<{
    id: string;
    kind: string;
    payload: unknown;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }> = [];
  reports: Array<{ id: string; placeId: string; message: string; createdAt: string }> = [];
  ambulanceLocations = new Map<
    string,
    { lat: number; lng: number; updatedAt: string; online: boolean }
  >();

  upsertNormalized(items: NormalizedPlace[], areaKey: string) {
    const now = new Date().toISOString();
    for (const item of items) {
      const stored = toStored(item, areaKey);
      stored.lastSyncedAt = now;
      this.places.set(stored.id, stored);
    }
  }

  touchArea(areaKey: string, lat: number, lng: number, radiusM: number, synced: boolean) {
    const prev = this.areas.get(areaKey);
    const now = new Date().toISOString();
    this.areas.set(areaKey, {
      areaKey,
      lat,
      lng,
      radiusM,
      lastSyncedAt: synced ? now : (prev?.lastSyncedAt ?? '1970-01-01T00:00:00.000Z'),
      lastRequestedAt: now,
    });
  }

  getArea(areaKey: string) {
    return this.areas.get(areaKey) ?? null;
  }

  search(opts: {
    lat: number;
    lng: number;
    radiusM: number;
    kinds?: string[];
    openNow?: boolean;
    q?: string;
  }): PlaceSearchResult[] {
    const near = { lat: opts.lat, lng: opts.lng };
    const q = opts.q?.toLowerCase();
    const results: PlaceSearchResult[] = [];
    for (const p of this.places.values()) {
      if (opts.kinds?.length && !opts.kinds.includes(p.kind)) continue;
      if (opts.openNow) {
        if (p.open24x7 !== true) continue;
      }
      if (q) {
        const hay = `${p.name} ${p.address ?? ''} ${p.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const distanceM = haversineM(near, p);
      if (distanceM > opts.radiusM) continue;
      results.push({ ...p, distanceM });
    }
    return results.sort((a, b) => a.distanceM - b.distanceM);
  }

  getById(id: string) {
    return this.places.get(id) ?? null;
  }

  addRegistration(kind: string, payload: unknown) {
    const row = {
      id: randomUUID(),
      kind,
      payload,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    this.registrations.push(row);
    return row;
  }

  listRegistrations(status?: string) {
    return status
      ? this.registrations.filter((r) => r.status === status)
      : this.registrations;
  }

  setRegistrationStatus(id: string, status: 'approved' | 'rejected') {
    const row = this.registrations.find((r) => r.id === id);
    if (!row) return null;
    row.status = status;
    if (status === 'approved') {
      const p = row.payload as {
        name: string;
        lat: number;
        lng: number;
        phone?: string;
        address?: string;
      };
      const kind = row.kind as StoredPlace['kind'];
      const stored: StoredPlace = {
        id: `registered:${row.id}`,
        source: 'registered',
        sourceId: row.id,
        kind,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        address: p.address ?? null,
        phone: p.phone ?? null,
        openingHours: null,
        open24x7: null,
        tags: [kind, 'registered'],
        verified: true,
        dataQuality: {
          missingPhone: !p.phone,
          missingHours: true,
          missingAddress: !p.address,
        },
        lastSyncedAt: new Date().toISOString(),
        areaKey: 'registered',
      };
      this.places.set(stored.id, stored);
    }
    return row;
  }

  addReport(placeId: string, message: string) {
    const row = {
      id: randomUUID(),
      placeId,
      message,
      createdAt: new Date().toISOString(),
    };
    this.reports.push(row);
    return row;
  }

  setAmbulanceLocation(id: string, lat: number, lng: number, online: boolean) {
    this.ambulanceLocations.set(id, {
      lat,
      lng,
      online,
      updatedAt: new Date().toISOString(),
    });
  }

  getAmbulanceLocation(id: string) {
    return this.ambulanceLocations.get(id) ?? null;
  }

  areasRequestedSince(days: number): AreaSyncRow[] {
    const cutoff = Date.now() - days * 86400000;
    return [...this.areas.values()].filter(
      (a) => new Date(a.lastRequestedAt).getTime() >= cutoff,
    );
  }
}

export const memoryStore = new MemoryStore();

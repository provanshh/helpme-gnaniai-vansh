import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config } from '../config.js';
import type { NormalizedPlace } from '../overpass/types.js';
import { memoryStore } from './memoryStore.js';
import type { AreaSyncRow, PlaceSearchResult, StoredPlace } from './types.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function usingPostgres(): boolean {
  return Boolean(config.databaseUrl);
}

export async function initDb(): Promise<'postgres' | 'memory'> {
  if (!config.databaseUrl) {
    console.warn('[db] DATABASE_URL not set — using in-memory store (OK for local demo)');
    return 'memory';
  }
  pool = new Pool({ connectionString: config.databaseUrl });
  const sqlPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrate.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('[db] Postgres + PostGIS ready');
  return 'postgres';
}

function rowToStored(r: Record<string, unknown>): StoredPlace {
  return {
    id: String(r.id),
    source: r.source as StoredPlace['source'],
    sourceId: String(r.source_id),
    kind: r.kind as StoredPlace['kind'],
    name: String(r.name),
    lat: Number(r.lat),
    lng: Number(r.lng),
    address: (r.address as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    openingHours: (r.opening_hours as string | null) ?? null,
    open24x7: (r.open_24x7 as boolean | null) ?? null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    verified: Boolean(r.verified),
    dataQuality: (r.data_quality as StoredPlace['dataQuality']) ?? {
      missingPhone: true,
      missingHours: true,
      missingAddress: true,
    },
    lastSyncedAt: new Date(String(r.last_synced_at)).toISOString(),
    areaKey: String(r.area_key),
  };
}

export async function upsertNormalized(items: NormalizedPlace[], areaKey: string) {
  if (!pool) {
    memoryStore.upsertNormalized(items, areaKey);
    return;
  }
  for (const p of items) {
    const id = `${p.source}:${p.sourceId}`;
    await pool.query(
      `INSERT INTO places (
        id, source, source_id, kind, name, lat, lng, geom, address, phone,
        opening_hours, open_24x7, tags, verified, data_quality, last_synced_at, area_key
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7, ST_SetSRID(ST_MakePoint($7,$6),4326)::geography,
        $8,$9,$10,$11,$12::jsonb,$13,$14::jsonb, now(), $15
      )
      ON CONFLICT (source, source_id) DO UPDATE SET
        name = EXCLUDED.name,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        geom = EXCLUDED.geom,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        opening_hours = EXCLUDED.opening_hours,
        open_24x7 = EXCLUDED.open_24x7,
        tags = EXCLUDED.tags,
        verified = EXCLUDED.verified,
        data_quality = EXCLUDED.data_quality,
        last_synced_at = now(),
        area_key = EXCLUDED.area_key`,
      [
        id,
        p.source,
        p.sourceId,
        p.kind,
        p.name,
        p.lat,
        p.lng,
        p.address,
        p.phone,
        p.openingHours,
        p.open24x7,
        JSON.stringify(p.tags),
        p.verified,
        JSON.stringify(p.dataQuality),
        areaKey,
      ],
    );
  }
}

export async function touchArea(
  areaKey: string,
  lat: number,
  lng: number,
  radiusM: number,
  synced: boolean,
) {
  if (!pool) {
    memoryStore.touchArea(areaKey, lat, lng, radiusM, synced);
    return;
  }
  await pool.query(
    `INSERT INTO area_sync (area_key, lat, lng, radius_m, last_synced_at, last_requested_at)
     VALUES ($1,$2,$3,$4, CASE WHEN $5 THEN now() ELSE '1970-01-01'::timestamptz END, now())
     ON CONFLICT (area_key) DO UPDATE SET
       last_requested_at = now(),
       radius_m = EXCLUDED.radius_m,
       last_synced_at = CASE WHEN $5 THEN now() ELSE area_sync.last_synced_at END`,
    [areaKey, lat, lng, radiusM, synced],
  );
}

export async function getArea(areaKey: string): Promise<AreaSyncRow | null> {
  if (!pool) return memoryStore.getArea(areaKey);
  const { rows } = await pool.query(
    `SELECT area_key, lat, lng, radius_m, last_synced_at, last_requested_at
     FROM area_sync WHERE area_key = $1`,
    [areaKey],
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    areaKey: r.area_key,
    lat: Number(r.lat),
    lng: Number(r.lng),
    radiusM: Number(r.radius_m),
    lastSyncedAt: new Date(r.last_synced_at).toISOString(),
    lastRequestedAt: new Date(r.last_requested_at).toISOString(),
  };
}

export async function searchPlaces(opts: {
  lat: number;
  lng: number;
  radiusM: number;
  kinds?: string[];
  openNow?: boolean;
  q?: string;
}): Promise<PlaceSearchResult[]> {
  if (!pool) return memoryStore.search(opts);

  const params: unknown[] = [opts.lng, opts.lat, opts.radiusM];
  let where = `ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)`;
  if (opts.kinds?.length) {
    params.push(opts.kinds);
    where += ` AND kind = ANY($${params.length}::text[])`;
  }
  if (opts.openNow) {
    where += ` AND open_24x7 IS TRUE`;
  }
  if (opts.q) {
    params.push(`%${opts.q.toLowerCase()}%`);
    where += ` AND (lower(name) LIKE $${params.length} OR lower(coalesce(address,'')) LIKE $${params.length})`;
  }

  const { rows } = await pool.query(
    `SELECT *, ST_Distance(geom, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m
     FROM places
     WHERE ${where}
     ORDER BY distance_m ASC
     LIMIT 200`,
    params,
  );

  return rows.map((r) => ({
    ...rowToStored(r),
    distanceM: Number(r.distance_m),
  }));
}

export async function getPlaceById(id: string): Promise<StoredPlace | null> {
  if (!pool) return memoryStore.getById(id);
  const { rows } = await pool.query(`SELECT * FROM places WHERE id = $1`, [id]);
  return rows[0] ? rowToStored(rows[0]) : null;
}

export async function addRegistration(kind: string, payload: unknown) {
  if (!pool) return memoryStore.addRegistration(kind, payload);
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO registrations (id, kind, payload, status) VALUES ($1,$2,$3::jsonb,'pending')`,
    [id, kind, JSON.stringify(payload)],
  );
  return { id, kind, payload, status: 'pending' as const, createdAt: new Date().toISOString() };
}

export async function listRegistrations(status = 'pending') {
  if (!pool) return memoryStore.listRegistrations(status);
  const { rows } = await pool.query(
    `SELECT id, kind, payload, status, created_at FROM registrations WHERE status = $1 ORDER BY created_at DESC`,
    [status],
  );
  return rows.map((r) => ({
    id: r.id as string,
    kind: r.kind as string,
    payload: r.payload,
    status: r.status as 'pending' | 'approved' | 'rejected',
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

export async function setRegistrationStatus(id: string, status: 'approved' | 'rejected') {
  if (!pool) return memoryStore.setRegistrationStatus(id, status);
  const { rows } = await pool.query(`SELECT * FROM registrations WHERE id = $1`, [id]);
  if (!rows[0]) return null;
  await pool.query(
    `UPDATE registrations SET status = $2, reviewed_at = now() WHERE id = $1`,
    [id, status],
  );
  if (status === 'approved') {
    const p = rows[0].payload as {
      name: string;
      lat: number;
      lng: number;
      phone?: string;
      address?: string;
    };
    const kind = rows[0].kind as StoredPlace['kind'];
    const placeId = `registered:${id}`;
    await pool.query(
      `INSERT INTO places (
        id, source, source_id, kind, name, lat, lng, geom, address, phone,
        opening_hours, open_24x7, tags, verified, data_quality, last_synced_at, area_key
      ) VALUES (
        $1,'registered',$2,$3,$4,$5,$6, ST_SetSRID(ST_MakePoint($6,$5),4326)::geography,
        $7,$8,NULL,NULL,$9::jsonb,true,$10::jsonb,now(),'registered'
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        placeId,
        id,
        kind,
        p.name,
        p.lat,
        p.lng,
        p.address ?? null,
        p.phone ?? null,
        JSON.stringify([kind, 'registered']),
        JSON.stringify({
          missingPhone: !p.phone,
          missingHours: true,
          missingAddress: !p.address,
        }),
      ],
    );
  }
  return { id, status };
}

export async function addReport(placeId: string, message: string) {
  if (!pool) return memoryStore.addReport(placeId, message);
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO place_reports (id, place_id, message) VALUES ($1,$2,$3)`,
    [id, placeId, message],
  );
  return { id, placeId, message, createdAt: new Date().toISOString() };
}

export async function setAmbulanceLocation(
  id: string,
  lat: number,
  lng: number,
  online: boolean,
) {
  if (!pool) {
    memoryStore.setAmbulanceLocation(id, lat, lng, online);
    return;
  }
  await pool.query(
    `INSERT INTO ambulance_locations (ambulance_id, lat, lng, updated_at, online)
     VALUES ($1,$2,$3,now(),$4)
     ON CONFLICT (ambulance_id) DO UPDATE SET lat=$2, lng=$3, updated_at=now(), online=$4`,
    [id, lat, lng, online],
  );
}

export async function getAmbulanceLocation(id: string) {
  if (!pool) return memoryStore.getAmbulanceLocation(id);
  const { rows } = await pool.query(
    `SELECT lat, lng, updated_at, online FROM ambulance_locations WHERE ambulance_id = $1`,
    [id],
  );
  if (!rows[0]) return null;
  return {
    lat: Number(rows[0].lat),
    lng: Number(rows[0].lng),
    updatedAt: new Date(rows[0].updated_at).toISOString(),
    online: Boolean(rows[0].online),
  };
}

export async function areasRequestedSince(days: number): Promise<AreaSyncRow[]> {
  if (!pool) return memoryStore.areasRequestedSince(days);
  const { rows } = await pool.query(
    `SELECT area_key, lat, lng, radius_m, last_synced_at, last_requested_at
     FROM area_sync
     WHERE last_requested_at >= now() - ($1 || ' days')::interval`,
    [days],
  );
  return rows.map((r) => ({
    areaKey: r.area_key,
    lat: Number(r.lat),
    lng: Number(r.lng),
    radiusM: Number(r.radius_m),
    lastSyncedAt: new Date(r.last_synced_at).toISOString(),
    lastRequestedAt: new Date(r.last_requested_at).toISOString(),
  }));
}

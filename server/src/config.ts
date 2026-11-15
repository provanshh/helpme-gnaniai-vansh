import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadEnv({ path: path.join(root, '.env') });
loadEnv({ path: path.join(root, 'server', '.env') });

function bool(v: string | undefined, fallback = false): boolean {
  if (v == null || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL?.trim() || '',
  overpassEndpoints: (process.env.OVERPASS_ENDPOINTS ??
    'https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.openstreetmap.ru/api/interpreter')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  placesRefreshDays: Number(process.env.PLACES_REFRESH_DAYS ?? 7),
  enableMappls: bool(process.env.ENABLE_MAPPLS, false),
  enableGoogle: bool(process.env.ENABLE_GOOGLE, false),
  mapplsClientId: process.env.MAPPLS_CLIENT_ID ?? '',
  mapplsClientSecret: process.env.MAPPLS_CLIENT_SECRET ?? '',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
  mapboxToken: process.env.VITE_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN ?? '',
  userAgent: 'HelpMe/0.1 (emergency medical help; contact: helpme@local)',
};

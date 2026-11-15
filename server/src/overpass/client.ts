import { config } from '../config.js';
import type { OverpassResponse } from './types.js';
import { buildAroundQuery } from './query.js';

let endpointIndex = 0;
const inFlight = new Map<string, Promise<OverpassResponse>>();

function nextEndpoint(): string {
  const list = config.overpassEndpoints;
  const url = list[endpointIndex % list.length]!;
  endpointIndex += 1;
  return url;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function fetchOverpassAround(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<OverpassResponse> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${Math.round(radiusM)}`;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const task = (async () => {
    const body = buildAroundQuery(lat, lng, radiusM);
    let lastError: unknown;
    // One pass per mirror, short timeout — public Overpass is often slow/rate-limited
    for (let attempt = 0; attempt < config.overpassEndpoints.length; attempt++) {
      const endpoint = nextEndpoint();
      try {
        console.log(`[overpass] try ${endpoint}`);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': config.userAgent,
          },
          body: `data=${encodeURIComponent(body)}`,
          signal: AbortSignal.timeout(12_000),
        });
        if (res.status === 429 || res.status === 504 || res.status === 502) {
          console.warn(`[overpass] ${res.status} from ${endpoint}`);
          await sleep(400 * 2 ** attempt);
          continue;
        }
        if (!res.ok) {
          throw new Error(`Overpass HTTP ${res.status}`);
        }
        const json = (await res.json()) as OverpassResponse;
        console.log(`[overpass] ok ${endpoint} elements=${json.elements?.length ?? 0}`);
        return json;
      } catch (err) {
        lastError = err;
        console.warn(`[overpass] fail ${endpoint}`, err instanceof Error ? err.message : err);
        await sleep(250 * 2 ** attempt);
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Overpass failed');
  })();

  inFlight.set(key, task);
  try {
    return await task;
  } finally {
    inFlight.delete(key);
  }
}

import { areasRequestedSince } from '../db/client.js';
import { ensureAreaIngested } from '../ingest/areaIngest.js';

/** Refresh areas requested in the last 30 days (call from cron or on interval). */
export async function refreshRecentAreas() {
  const areas = await areasRequestedSince(30);
  console.log(`[nightly] refreshing ${areas.length} areas`);
  for (const a of areas) {
    await ensureAreaIngested(a.lat, a.lng, a.radiusM || 10_000);
  }
}

export function startNightlyScheduler() {
  const dayMs = 24 * 60 * 60 * 1000;
  // Run once a day; first check after 1 hour so boot is quiet
  setTimeout(() => {
    void refreshRecentAreas();
    setInterval(() => void refreshRecentAreas(), dayMs);
  }, 60 * 60 * 1000);
}

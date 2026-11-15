import { Router } from 'express';
import { getAmbulanceLocation, searchPlaces, setAmbulanceLocation } from '../db/client.js';
import { sseHub } from '../jobs/sseHub.js';

export const ambulancesRouter = Router();

ambulancesRouter.get('/nearby', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng required' });
    return;
  }
  const places = await searchPlaces({
    lat,
    lng,
    radiusM: Number(req.query.radius ?? 15000),
    kinds: ['ambulance'],
  });
  res.json({
    ambulances: places.map((p) => ({
      id: p.id,
      provider: p.name,
      type: 'private' as const,
      level: 'basic' as const,
      lat: p.lat,
      lng: p.lng,
      available: true,
      phone: p.phone ?? '',
      distanceKm: Math.round((p.distanceM / 1000) * 10) / 10,
      hasLiveGps: false,
      demo: false,
    })),
  });
});

ambulancesRouter.post('/:id/location', async (req, res) => {
  const lat = Number(req.body?.lat);
  const lng = Number(req.body?.lng);
  const online = Boolean(req.body?.online ?? true);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'lat and lng required' });
    return;
  }
  const id = req.params.id;
  await setAmbulanceLocation(id, lat, lng, online);
  sseHub.broadcast(`ambulance:${id}`, {
    type: 'ambulance_location',
    ambulanceId: id,
    lat,
    lng,
    online,
    at: new Date().toISOString(),
  });
  // Also fan-out to any request streams listening for this ambulance
  sseHub.broadcastToRequestByAmbulance(id, {
    type: 'ambulance_location',
    ambulanceId: id,
    lat,
    lng,
    online,
    at: new Date().toISOString(),
  });
  res.json({ ok: true });
});

ambulancesRouter.get('/:id/location', async (req, res) => {
  const loc = await getAmbulanceLocation(req.params.id);
  if (!loc) {
    res.status(404).json({ error: 'No live location' });
    return;
  }
  res.json(loc);
});

import { Router } from 'express';
import { addRegistration } from '../db/client.js';

export const registerRouter = Router();

function parseBody(body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = String(b.name ?? '').trim();
  const lat = Number(b.lat);
  const lng = Number(b.lng);
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return {
    name,
    lat,
    lng,
    phone: b.phone ? String(b.phone) : undefined,
    address: b.address ? String(b.address) : undefined,
    notes: b.notes ? String(b.notes) : undefined,
  };
}

for (const kind of ['ambulance', 'ngo', 'doctor'] as const) {
  registerRouter.post(`/${kind}`, async (req, res) => {
    const payload = parseBody(req.body);
    if (!payload) {
      res.status(400).json({ error: 'name, lat, lng required' });
      return;
    }
    const row = await addRegistration(kind, payload);
    res.status(201).json({
      ok: true,
      id: row.id,
      status: 'pending',
      message: 'Pending admin verification',
    });
  });
}

import { Router } from 'express';
import { listRegistrations, setRegistrationStatus } from '../db/client.js';

export const adminRouter = Router();

adminRouter.get('/registrations', async (req, res) => {
  const status = String(req.query.status ?? 'pending');
  const rows = await listRegistrations(status);
  res.json({ registrations: rows });
});

adminRouter.post('/registrations/:id/approve', async (req, res) => {
  const row = await setRegistrationStatus(req.params.id, 'approved');
  if (!row) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true, status: 'approved' });
});

adminRouter.post('/registrations/:id/reject', async (req, res) => {
  const row = await setRegistrationStatus(req.params.id, 'rejected');
  if (!row) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true, status: 'rejected' });
});

import { Router } from 'express';
import { sseHub } from '../jobs/sseHub.js';

export const streamRouter = Router();

streamRouter.get('/requests/:id', (req, res) => {
  const ambulanceId = req.query.ambulanceId ? String(req.query.ambulanceId) : undefined;
  if (ambulanceId) sseHub.bindRequestAmbulance(req.params.id, ambulanceId);
  sseHub.subscribeRequest(req.params.id, res, ambulanceId);
});

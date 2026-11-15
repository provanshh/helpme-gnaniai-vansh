import { Router } from 'express';

export const EMERGENCY_NUMBERS = {
  national: '112',
  ambulance: '102',
  disaster: '108',
} as const;

export const emergencyRouter = Router();

emergencyRouter.get('/', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.json({
    numbers: EMERGENCY_NUMBERS,
    note: 'Also hardcoded in the client for offline use',
  });
});

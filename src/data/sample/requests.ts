import type { HospitalDashboardSample, SampleRequest } from '@/types/domain';

export const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    id: 'r1',
    kind: 'blood',
    bloodGroup: 'B+',
    units: 2,
    status: 'Donor accepted',
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    donorId: 'd1',
    hospitalId: 'h1',
    handoverCode: 'HM-4821',
  },
  {
    id: 'r2',
    kind: 'ambulance',
    status: 'On the way',
    createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    ambulanceId: 'a1',
    etaMin: 8,
  },
  {
    id: 'r3',
    kind: 'blood',
    bloodGroup: 'O-',
    units: 1,
    status: 'Completed',
    createdAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    donorId: 'd5',
    hospitalId: 'h2',
  },
];

export const SAMPLE_HOSPITAL_DASHBOARD: HospitalDashboardSample = {
  hospitalId: 'h1',
  stats: {
    activeRequests: 3,
    bloodUnits: 56,
    icuBedsFree: 4,
    ambulancesFree: 2,
  },
  incoming: [
    { id: 'in1', need: 'B+ blood · 2 units', distanceKm: 1.2, etaMin: 6, urgency: 'high' },
    { id: 'in2', need: 'Trauma intake', distanceKm: 2.4, etaMin: 11, urgency: 'high' },
    { id: 'in3', need: 'ICU bed hold', distanceKm: 3.1, etaMin: 14, urgency: 'medium' },
  ],
};

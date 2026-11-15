import { SAMPLE_REQUESTS } from '@/data/sample';
import { delay } from '@/lib/geo';
import type { BloodGroup, RequestStatus, SampleRequest } from '@/types/domain';

export interface RequestService {
  list(): Promise<SampleRequest[]>;
  createBloodRequest(input: {
    bloodGroup: BloodGroup;
    units: number;
  }): Promise<SampleRequest>;
  simulateBloodProgress(
    id: string,
    onUpdate: (req: SampleRequest) => void,
  ): () => void;
}

let runtime: SampleRequest[] = [...SAMPLE_REQUESTS];

const FLOW: RequestStatus[] = ['Searching', 'Donor accepted', 'On the way', 'Handover'];

export const sampleRequestService: RequestService = {
  async list() {
    await delay(180);
    return [...runtime].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
  async createBloodRequest({ bloodGroup, units }) {
    await delay(250);
    const req: SampleRequest = {
      id: `r-${Date.now()}`,
      kind: 'blood',
      bloodGroup,
      units,
      status: 'Searching',
      createdAt: new Date().toISOString(),
      hospitalId: 'h1',
      handoverCode: `HM-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    runtime = [req, ...runtime];
    return req;
  },
  simulateBloodProgress(id, onUpdate) {
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const status = FLOW[Math.min(step, FLOW.length - 1)];
      runtime = runtime.map((r) => {
        if (r.id !== id) return r;
        const next = {
          ...r,
          status,
          donorId: step >= 1 ? r.donorId ?? 'd1' : r.donorId,
        };
        onUpdate(next);
        return next;
      });
      if (step >= FLOW.length - 1) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  },
};

export const requestService: RequestService = sampleRequestService;

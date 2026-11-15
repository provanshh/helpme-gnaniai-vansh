import type { Response } from 'express';

type Client = { res: Response; ambulanceId?: string };

class SseHub {
  private requestClients = new Map<string, Set<Client>>();
  private channelClients = new Map<string, Set<Client>>();
  private requestAmbulance = new Map<string, string>();

  subscribeRequest(requestId: string, res: Response, ambulanceId?: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ requestId })}\n\n`);

    const set = this.requestClients.get(requestId) ?? new Set();
    const client: Client = { res, ambulanceId };
    set.add(client);
    this.requestClients.set(requestId, set);
    if (ambulanceId) this.requestAmbulance.set(requestId, ambulanceId);

    reqOnClose(res, () => {
      set.delete(client);
      if (set.size === 0) this.requestClients.delete(requestId);
    });
  }

  subscribeChannel(channel: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const set = this.channelClients.get(channel) ?? new Set();
    const client: Client = { res };
    set.add(client);
    this.channelClients.set(channel, set);
    reqOnClose(res, () => {
      set.delete(client);
      if (set.size === 0) this.channelClients.delete(channel);
    });
  }

  bindRequestAmbulance(requestId: string, ambulanceId: string) {
    this.requestAmbulance.set(requestId, ambulanceId);
  }

  broadcast(channel: string, payload: unknown) {
    const set = this.channelClients.get(channel);
    if (!set) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const c of set) c.res.write(data);
  }

  broadcastRequest(requestId: string, payload: unknown) {
    const set = this.requestClients.get(requestId);
    if (!set) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const c of set) c.res.write(data);
  }

  broadcastToRequestByAmbulance(ambulanceId: string, payload: unknown) {
    for (const [requestId, ambId] of this.requestAmbulance) {
      if (ambId === ambulanceId) this.broadcastRequest(requestId, payload);
    }
  }
}

function reqOnClose(res: Response, fn: () => void) {
  res.on('close', fn);
}

export const sseHub = new SseHub();

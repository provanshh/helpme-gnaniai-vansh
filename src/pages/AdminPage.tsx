import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Registration {
  id: string;
  kind: string;
  payload: { name?: string; phone?: string; address?: string; lat?: number; lng?: number };
  status: string;
  createdAt: string;
}

export function AdminPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    void apiFetch('/api/admin/registrations?status=pending')
      .then(async (r) => {
        if (!r.ok) throw new Error('fail');
        const data = (await r.json()) as { registrations: Registration[] };
        setRows(data.registrations);
      })
      .catch(() => setMsg('Could not load registrations — is the API running?'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    const res = await apiFetch(`/api/admin/registrations/${id}/${action}`, { method: 'POST' });
    setMsg(res.ok ? `${action}d` : 'failed');
    load();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-3 bg-bg p-4 text-[13px]">
      <h1 className="font-[family-name:var(--font-sans)] text-lg font-bold">Admin · Registrations</h1>
      <p className="text-text-secondary">Approve ambulance / NGO / doctor registrations.</p>
      {msg && <p className="text-primary font-semibold">{msg}</p>}
      {rows.length === 0 ? (
        <p className="text-text-secondary">No pending registrations.</p>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="rounded-xl bg-surface p-3 shadow-[var(--shadow-card)]">
            <p className="font-bold">
              {r.kind} · {r.payload.name}
            </p>
            <p className="text-[11px] text-text-secondary">
              {r.payload.phone ?? 'No phone'} · {r.payload.address ?? 'No address'}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="min-h-9 flex-1 rounded-lg bg-primary text-xs font-bold text-on-primary"
                onClick={() => void act(r.id, 'approve')}
              >
                Approve
              </button>
              <button
                type="button"
                className="min-h-9 flex-1 rounded-lg bg-surface-low text-xs font-bold"
                onClick={() => void act(r.id, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

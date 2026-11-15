import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Minimal driver PWA page: enter ambulance code, go online, post GPS every 3–5s.
 * Outside AppShell onboarding — open at /driver
 */
export function DriverPage() {
  const [code, setCode] = useState('amb-demo-1');
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState('Enter code and go online');
  const [last, setLast] = useState<{ lat: number; lng: number } | null>(null);
  const watchRef = useRef<number | null>(null);
  const lastPost = useRef(0);

  useEffect(() => {
    if (!online) {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setStatus('Geolocation unavailable');
      setOnline(false);
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastPost.current < 3500) return;
        lastPost.current = now;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLast({ lat, lng });
        void apiFetch(`/api/ambulances/${encodeURIComponent(code)}/location`, {
          method: 'POST',
          body: JSON.stringify({ lat, lng, online: true }),
        })
          .then((r) => {
            setStatus(r.ok ? `Online · posted ${new Date().toLocaleTimeString()}` : 'Post failed');
          })
          .catch(() => setStatus('Network error'));
      },
      () => setStatus('GPS error'),
      { enableHighAccuracy: true, maximumAge: 2000 },
    );

    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [online, code]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-bg p-4 text-[13px] text-text">
      <h1 className="font-[family-name:var(--font-sans)] text-lg font-bold">HelpMe Driver</h1>
      <p className="text-text-secondary">Share live ambulance GPS with the requester map.</p>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold">Ambulance code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          disabled={online}
          className="h-11 rounded-xl bg-surface-low px-3 outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => setOnline((v) => !v)}
        className={`min-h-12 rounded-xl font-bold text-on-primary ${online ? 'bg-sos' : 'bg-primary'}`}
      >
        {online ? 'Go offline' : 'Go online'}
      </button>
      <p className="font-semibold text-primary">{status}</p>
      {last && (
        <p className="text-text-secondary">
          {last.lat.toFixed(5)}, {last.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}

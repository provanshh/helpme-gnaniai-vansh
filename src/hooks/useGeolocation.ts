import { useEffect, useRef } from 'react';
import { DEFAULT_LOCATION } from '@/types/domain';
import { useAppStore } from '@/store/appStore';

const THROTTLE_MS = 3000;

export function useGeolocationBootstrap() {
  const setLocation = useAppStore((s) => s.setLocation);
  const setGpsActive = useAppStore((s) => s.setGpsActive);
  const setUsingSampleLocation = useAppStore((s) => s.setUsingSampleLocation);
  const setGpsAccuracyM = useAppStore((s) => s.setGpsAccuracyM);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation('Rohini, Delhi (fallback)', DEFAULT_LOCATION);
      setGpsActive(false);
      setUsingSampleLocation(true);
      setGpsAccuracyM(null);
      return;
    }

    const apply = (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdate.current < THROTTLE_MS && lastUpdate.current > 0) return;
      lastUpdate.current = now;
      setLocation('Current location', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setGpsActive(true);
      setUsingSampleLocation(false);
      setGpsAccuracyM(
        Number.isFinite(pos.coords.accuracy) ? Math.round(pos.coords.accuracy) : null,
      );
    };

    navigator.geolocation.getCurrentPosition(apply, () => {
      setLocation('Rohini, Delhi (fallback)', DEFAULT_LOCATION);
      setGpsActive(false);
      setUsingSampleLocation(true);
      setGpsAccuracyM(null);
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 });

    const watchId = navigator.geolocation.watchPosition(
      apply,
      () => {
        /* keep last known / fallback */
      },
      { enableHighAccuracy: true, maximumAge: THROTTLE_MS, timeout: 15_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setGpsActive, setGpsAccuracyM, setLocation, setUsingSampleLocation]);
}

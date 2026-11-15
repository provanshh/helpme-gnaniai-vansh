/** Overpass query template — lat, lng, radius meters. */
export function buildAroundQuery(lat: number, lng: number, radiusM: number): string {
  const R = Math.round(radiusM);
  const LAT = lat.toFixed(6);
  const LNG = lng.toFixed(6);
  return `
[out:json][timeout:25];
(
  nwr["amenity"~"hospital|clinic|doctors|pharmacy|blood_bank"](around:${R},${LAT},${LNG});
  nwr["healthcare"~"clinic|doctor|blood_donation|hospital"](around:${R},${LAT},${LNG});
  nwr["emergency"="ambulance_station"](around:${R},${LAT},${LNG});
  nwr["office"="ngo"](around:${R},${LAT},${LNG});
  nwr["amenity"="social_facility"](around:${R},${LAT},${LNG});
);
out center tags;
`.trim();
}

/** Stable area key for cache tiles (~0.05° ≈ 5 km). */
export function areaKey(lat: number, lng: number, precision = 1): string {
  const f = 10 ** precision;
  return `${Math.round(lat * f) / f},${Math.round(lng * f) / f}`;
}

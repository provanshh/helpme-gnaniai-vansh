import type {
  NormalizedPlace,
  OverpassElement,
  OverpassResponse,
  PlaceKind,
} from './types.js';

function pickName(tags: Record<string, string>, lang?: string): string | null {
  if (lang === 'hi' && tags['name:hi']) return tags['name:hi'];
  if (tags['name:en']) return tags['name:en'];
  if (tags.name) return tags.name;
  if (tags['official_name']) return tags['official_name'];
  return null;
}

function pickPhone(tags: Record<string, string>): string | null {
  const raw = tags.phone ?? tags['contact:phone'] ?? tags['contact:mobile'] ?? null;
  if (!raw) return null;
  return raw.split(';')[0]?.trim() || null;
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] ?? tags['addr:neighbourhood'],
    tags['addr:city'] ?? tags['addr:town'] ?? tags['addr:village'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (tags['addr:full']) return tags['addr:full'];
  return null;
}

function isOpen24x7(hours: string | null, tags: Record<string, string>): boolean | null {
  if (tags['opening_hours'] === '24/7' || tags['24/7'] === 'yes') return true;
  if (hours && /24\s*\/\s*7/i.test(hours)) return true;
  if (!hours) return null;
  return false;
}

/** Map OSM tags → our place kinds (see OSM wiki amenity/healthcare). */
export function kindFromTags(tags: Record<string, string>): PlaceKind | null {
  const amenity = tags.amenity;
  const healthcare = tags.healthcare;
  const emergency = tags.emergency;
  const office = tags.office;

  if (amenity === 'hospital' || healthcare === 'hospital') return 'hospital';
  if (amenity === 'blood_bank' || healthcare === 'blood_donation') return 'blood_bank';
  if (emergency === 'ambulance_station') return 'ambulance';
  if (amenity === 'pharmacy') return 'pharmacy';
  if (amenity === 'doctors' || healthcare === 'doctor') return 'doctor';
  if (amenity === 'clinic' || healthcare === 'clinic') return 'clinic';
  if (office === 'ngo' || amenity === 'social_facility') return 'ngo';
  return null;
}

function collectTags(tags: Record<string, string>, kind: PlaceKind): string[] {
  const out: string[] = [kind];
  if (tags.emergency === 'yes') out.push('emergency');
  if (tags['healthcare:speciality']) {
    out.push(
      ...tags['healthcare:speciality']
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3),
    );
  }
  if (tags['opening_hours'] === '24/7') out.push('24x7');
  return [...new Set(out)];
}

export function normalizeElement(
  el: OverpassElement,
  lang?: string,
): NormalizedPlace | null {
  const tags = el.tags ?? {};
  const kind = kindFromTags(tags);
  if (!kind) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const name = pickName(tags, lang) ?? `${kind.replace('_', ' ')} (unnamed)`;
  const phone = pickPhone(tags);
  const openingHours = tags.opening_hours ?? tags['opening_hours:covid19'] ?? null;
  const address = buildAddress(tags);

  return {
    source: 'osm',
    sourceId: `${el.type}/${el.id}`,
    kind,
    name,
    lat,
    lng,
    address,
    phone,
    openingHours,
    open24x7: isOpen24x7(openingHours, tags),
    tags: collectTags(tags, kind),
    verified: false,
    dataQuality: {
      missingPhone: !phone,
      missingHours: !openingHours,
      missingAddress: !address,
    },
  };
}

export function normalizeOverpassResponse(
  data: OverpassResponse,
  lang?: string,
): NormalizedPlace[] {
  const seen = new Set<string>();
  const places: NormalizedPlace[] = [];
  for (const el of data.elements ?? []) {
    const place = normalizeElement(el, lang);
    if (!place) continue;
    if (seen.has(place.sourceId)) continue;
    seen.add(place.sourceId);
    places.push(place);
  }
  return places;
}

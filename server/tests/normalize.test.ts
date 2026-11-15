import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  kindFromTags,
  normalizeElement,
  normalizeOverpassResponse,
} from '../src/overpass/normalize.js';
import type { OverpassResponse } from '../src/overpass/types.js';

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures/overpass-sample.json',
);

describe('OSM normalizer', () => {
  it('maps amenity/healthcare tags to kinds', () => {
    assert.equal(kindFromTags({ amenity: 'hospital' }), 'hospital');
    assert.equal(kindFromTags({ healthcare: 'clinic' }), 'clinic');
    assert.equal(kindFromTags({ amenity: 'doctors' }), 'doctor');
    assert.equal(kindFromTags({ amenity: 'pharmacy' }), 'pharmacy');
    assert.equal(kindFromTags({ emergency: 'ambulance_station' }), 'ambulance');
    assert.equal(kindFromTags({ healthcare: 'blood_donation' }), 'blood_bank');
    assert.equal(kindFromTags({ office: 'ngo' }), 'ngo');
    assert.equal(kindFromTags({ amenity: 'cafe' }), null);
  });

  it('marks missing phone and hours honestly', () => {
    const place = normalizeElement({
      type: 'node',
      id: 1,
      lat: 1,
      lon: 2,
      tags: { amenity: 'pharmacy', name: 'No Contact Chemist' },
    });
    assert.ok(place);
    assert.equal(place!.phone, null);
    assert.equal(place!.openingHours, null);
    assert.equal(place!.open24x7, null);
    assert.equal(place!.dataQuality.missingPhone, true);
    assert.equal(place!.dataQuality.missingHours, true);
    assert.equal(place!.verified, false);
  });

  it('normalizes recorded Overpass fixture without live calls', () => {
    const raw = JSON.parse(readFileSync(fixturePath, 'utf8')) as OverpassResponse;
    const places = normalizeOverpassResponse(raw);
    assert.equal(places.length, 7);
    assert.ok(places.every((p) => p.source === 'osm'));
    assert.ok(!places.some((p) => p.name === 'Should Be Ignored'));

    const hospital = places.find((p) => p.kind === 'hospital')!;
    assert.equal(hospital.phone, '+91 11 0000 0001');
    assert.equal(hospital.open24x7, true);
    assert.equal(hospital.dataQuality.missingPhone, false);

    const pharmacy = places.find((p) => p.kind === 'pharmacy')!;
    assert.equal(pharmacy.phone, null);
    assert.equal(pharmacy.dataQuality.missingHours, true);

    const hindi = normalizeOverpassResponse(raw, 'hi').find((p) => p.kind === 'hospital')!;
    assert.equal(hindi.name, 'नमूना अस्पताल');
  });
});

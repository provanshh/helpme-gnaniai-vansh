export type PlaceSource = 'osm' | 'mappls' | 'google' | 'import' | 'registered';

export type PlaceKind =
  | 'hospital'
  | 'clinic'
  | 'doctor'
  | 'pharmacy'
  | 'ambulance'
  | 'blood_bank'
  | 'ngo';

export interface DataQuality {
  missingPhone: boolean;
  missingHours: boolean;
  missingAddress: boolean;
  approximateCoords?: boolean;
}

export interface NormalizedPlace {
  source: PlaceSource;
  sourceId: string;
  kind: PlaceKind;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  open24x7: boolean | null;
  tags: string[];
  verified: boolean;
  dataQuality: DataQuality;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements?: OverpassElement[];
}

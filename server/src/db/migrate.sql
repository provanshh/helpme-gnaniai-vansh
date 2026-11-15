CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('osm','mappls','google','import','registered')),
  source_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('hospital','clinic','doctor','pharmacy','ambulance','blood_bank','ngo')),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom geography(Point, 4326),
  address TEXT,
  phone TEXT,
  opening_hours TEXT,
  open_24x7 BOOLEAN,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT false,
  data_quality JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  area_key TEXT NOT NULL,
  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS places_geom_gix ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS places_kind_idx ON places (kind);
CREATE INDEX IF NOT EXISTS places_area_key_idx ON places (area_key);
CREATE INDEX IF NOT EXISTS places_last_synced_idx ON places (last_synced_at);

CREATE TABLE IF NOT EXISTS area_sync (
  area_key TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_m INTEGER NOT NULL DEFAULT 10000,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('ambulance','ngo','doctor')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS place_reports (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambulance_locations (
  ambulance_id TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  online BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS request_streams (
  id TEXT PRIMARY KEY,
  ambulance_id TEXT,
  status TEXT NOT NULL DEFAULT 'Searching',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

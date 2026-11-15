import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

let ready = false;

/** Call once before creating any MapLibre map (Vite requires an explicit worker). */
export function ensureMapLibreWorker() {
  if (ready) return;
  setWorkerUrl(workerUrl);
  ready = true;
}

/**
 * Esri World Street Map — full-color “real” street tiles, no API key for light demo use.
 * Attribution required: Esri + OpenStreetMap contributors.
 */
export const STREET_RASTER_STYLE = {
  version: 8 as const,
  name: 'Esri Streets',
  sources: {
    esri: {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri — Source: Esri, OpenStreetMap',
      maxzoom: 18,
    },
  },
  layers: [
    {
      id: 'esri-streets',
      type: 'raster' as const,
      source: 'esri',
    },
  ],
};

/** Free vector styles (no key) if raster is blocked. */
export const STREET_STYLE = 'https://tiles.openfreemap.org/styles/bright';
export const STREET_STYLE_FALLBACK = 'https://tiles.openfreemap.org/styles/liberty';

/** @deprecated alias kept for older imports */
export const OSM_RASTER_STYLE = STREET_RASTER_STYLE;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';
import type { Place, PlaceKind, PlacesSearchMeta, RouteResult } from '@/types/domain';
import { DEFAULT_LOCATION } from '@/types/domain';

export type ServiceFilter = 'all' | PlaceKind | 'ai';
export type VoiceState = 'idle' | 'listening' | 'understanding' | 'speaking' | 'error';
export type SheetSnap = 'peek' | 'half' | 'full';
export type MapPitch = '2d' | '3d';

interface AppState {
  onboarded: boolean;
  language: string;
  locationLabel: string;
  gpsActive: boolean;
  usingSampleLocation: boolean;
  gpsAccuracyM: number | null;
  coords: { lat: number; lng: number };
  activeFilters: ServiceFilter[];
  selectedPlaceId: string | null;
  places: Place[];
  placesMeta: PlacesSearchMeta | null;
  route: RouteResult | null;
  voiceState: VoiceState;
  voiceTranscript: string;
  voiceReply: string;
  sheetSnap: SheetSnap;
  mapPitch: MapPitch;
  setOnboarded: (v: boolean) => void;
  setLanguage: (lang: string) => void;
  setLocation: (label: string, coords?: { lat: number; lng: number } | null) => void;
  setGpsActive: (v: boolean) => void;
  setUsingSampleLocation: (v: boolean) => void;
  setGpsAccuracyM: (m: number | null) => void;
  setActiveFilters: (filters: ServiceFilter[]) => void;
  toggleFilter: (filter: ServiceFilter) => void;
  setSelectedPlaceId: (id: string | null) => void;
  setPlaces: (places: Place[], meta?: PlacesSearchMeta | null) => void;
  setRoute: (route: RouteResult | null) => void;
  setVoiceState: (state: VoiceState) => void;
  setVoiceCopy: (transcript: string, reply: string) => void;
  setSheetSnap: (snap: SheetSnap) => void;
  setMapPitch: (pitch: MapPitch) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      language: 'en',
      locationLabel: 'Rohini, Delhi (fallback)',
      gpsActive: false,
      usingSampleLocation: true,
      gpsAccuracyM: null,
      coords: DEFAULT_LOCATION,
      activeFilters: ['all'],
      selectedPlaceId: null,
      places: [],
      placesMeta: null,
      route: null,
      voiceState: 'idle',
      voiceTranscript: '',
      voiceReply: '',
      sheetSnap: 'half',
      mapPitch: '3d',
      setOnboarded: (v) => set({ onboarded: v }),
      setLanguage: (lang) => {
        void i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setLocation: (label, coords) =>
        set({
          locationLabel: label,
          ...(coords ? { coords } : {}),
        }),
      setGpsActive: (v) => set({ gpsActive: v }),
      setUsingSampleLocation: (v) => set({ usingSampleLocation: v }),
      setGpsAccuracyM: (m) => set({ gpsAccuracyM: m }),
      setActiveFilters: (filters) => set({ activeFilters: filters, selectedPlaceId: null, route: null }),
      toggleFilter: (filter) => {
        if (filter === 'all') {
          set({ activeFilters: ['all'], selectedPlaceId: null, route: null });
          return;
        }
        const current = get().activeFilters.filter((f) => f !== 'all');
        const next = current.includes(filter)
          ? current.filter((f) => f !== filter)
          : [...current, filter];
        set({
          activeFilters: next.length ? next : ['all'],
          selectedPlaceId: null,
          route: null,
        });
      },
      setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
      setPlaces: (places, meta) =>
        set({ places, ...(meta !== undefined ? { placesMeta: meta } : {}) }),
      setRoute: (route) => set({ route }),
      setVoiceState: (voiceState) => set({ voiceState }),
      setVoiceCopy: (voiceTranscript, voiceReply) => set({ voiceTranscript, voiceReply }),
      setSheetSnap: (sheetSnap) => set({ sheetSnap }),
      setMapPitch: (mapPitch) => set({ mapPitch }),
    }),
    {
      name: 'helpme-app',
      partialize: (s) => ({
        onboarded: s.onboarded,
        language: s.language,
        locationLabel: s.locationLabel,
      }),
    },
  ),
);

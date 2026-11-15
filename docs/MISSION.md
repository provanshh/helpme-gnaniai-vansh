# HELPME: MISSION, GOAL AND BUILD BRIEF

## 1. MISSION
In India, people in a medical emergency lose critical minutes finding blood, a hospital, an ambulance or a pharmacy. Many are in villages, many cannot read English, and many are panicking.

HelpMe's mission: put emergency medical help one tap or one spoken sentence away for EVERY person in India, in their own language, on any phone, in cities and in villages.

## 2. FINAL GOAL
Ship a production-quality web app (installable PWA) where a person can:
- Press SOS and instantly share their live location with the nearest hospital and ambulance and with their emergency contact (via Telegram).
- Find BLOOD (donors and blood banks) and send a request that donors accept from Telegram.
- Find nearby HOSPITALS, DOCTORS/CLINICS, MEDICINE/PHARMACIES and AMBULANCES on a live 3D map, with a route, distance and ETA.
- Talk to an AI HELPER by voice, in their own language, which does these tasks on their behalf.
- Use everything in 10+ Indian languages, by voice or touch.
Also provide a donor side (register, get alerted, accept) and a hospital side (blood stock, incoming requests, beds, ambulances).

## 3. USERS
1. Person in need or their family (urban or rural, any literacy level, often panicking, mid-range Android phone, weak network).
2. Blood donor (wants a simple alert and one-tap accept).
3. Hospital staff (wants a clear incoming-request and stock dashboard).

## 4. PRODUCT PRINCIPLES (decide every trade-off with these)
1. Speed over features: the first useful action must be reachable in under 3 seconds.
2. One main action per screen. Never overload. Only essential info.
3. Understandable without reading: big icons, short plain words, voice everywhere.
4. Local language first: toggle visible on every screen; all text from translation files.
5. Map and voice on EVERY screen. Desktop: content left, map + voice right. Mobile: map on top, content in a bottom sheet, floating mic.
6. Home map shows ALL services around the user; every other page's map shows only that page's service. Selecting a service filters the map. Selecting a place draws the route.
7. Red is ONLY for SOS and urgent items. Spacious, calm, trustworthy, professional. Smooth but fast animation (never block the user).
8. Works on poor networks: fast load, skeletons, offline shell, cached emergency numbers (112, 102, 108).
9. Safety and honesty: never present sample data as real. Never expose real personal data. Always show "For emergencies call 112" on key screens.

## 5. WHAT TO USE FOR WHAT
| Need | Use | Notes |
|------|-----|-------|
| Frontend | React + TypeScript + Vite, Tailwind CSS, React Router, Zustand | One responsive codebase, breakpoint 1024px |
| Animation | Framer Motion | transform/opacity only, respect reduced-motion |
| Icons | Lucide React via one Icon wrapper | No emojis, no mixed icon sets |
| Map rendering + 3D | Mapbox GL JS | 3D buildings, pitch, markers, clustering |
| Routing (path, distance, ETA) | Mapbox Directions API | Driving profile; walking optional |
| Geocoding / location search | Mapbox Geocoding API | Manual location fallback |
| Live location | Browser Geolocation API | Permission flow + fallback |
| Places data (later) | OpenStreetMap Overpass API | Cached on the backend. NOW: sample data only |
| Voice: speech to text | Gnani Prisma | Via backend proxy only |
| Voice: text to speech | Gnani Timbre | Via backend proxy only. Web Speech API fallback in dev |
| AI helper brain | An LLM with tool calling (Claude API) | Tools: findBlood, findPlaces, requestAmbulance, sendAlert, switchLanguage |
| Languages | react-i18next | English + Hindi first; then more Indic languages |
| Backend | Node.js (TypeScript) with Express or Fastify | All secrets live here |
| Database | PostgreSQL + PostGIS | Distance and radius queries |
| Realtime | Server-Sent Events (or WebSocket) | Request status, ambulance location |
| Notifications | Telegram Bot API (grammY) | Donor alerts, SOS contact alerts, status updates |
| Auth | Phone OTP | MOCKED for now |

Env vars (.env.example): VITE_MAPBOX_TOKEN, GNANI_API_KEY, LLM_API_KEY, TELEGRAM_BOT_TOKEN, DATABASE_URL. Secrets never go to the client except the public Mapbox token.

## 6. DESIGN SOURCE
/design-reference holds Stitch exports (screenshot + code), desktop and mobile pairs. Screenshots are the visual source of truth. Do not copy Stitch HTML.

## 7. LIVE PLACES DATA (supersedes older “sample places” scope)
Places (hospitals, clinics, doctors, pharmacies, ambulances, blood banks, NGOs) come from OpenStreetMap via the Node backend (`server/`), cached in Postgres/PostGIS or an in-memory store. Donors and request progress remain **demo-seeded and labeled**. See the LIVE DATA UPDATE brief and `README.md` for sources, adapters, and honesty rules.

## 8–11
See original HelpMe master mission prompt for data model, definition of done, and working rules. Sample place coordinates in older Section 8 are obsolete for places.

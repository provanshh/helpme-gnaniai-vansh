---
name: HelpMe Emergency Medical Response
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e4efff'
  surface-container-high: '#dee9fa'
  surface-container-highest: '#d8e3f5'
  on-surface: '#111c29'
  on-surface-variant: '#3d4946'
  inverse-surface: '#27313e'
  inverse-on-surface: '#e9f1ff'
  outline: '#6d7a76'
  outline-variant: '#bcc9c5'
  surface-tint: '#006b5f'
  primary: '#00685c'
  on-primary: '#ffffff'
  primary-container: '#008375'
  on-primary-container: '#f4fffb'
  inverse-primary: '#63dac7'
  secondary: '#b7131a'
  on-secondary: '#ffffff'
  secondary-container: '#db322f'
  on-secondary-container: '#fffbff'
  tertiary: '#525c6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7587'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#81f6e3'
  primary-fixed-dim: '#63dac7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#d9e3f7'
  tertiary-fixed-dim: '#bdc7db'
  on-tertiary-fixed: '#121c2b'
  on-tertiary-fixed-variant: '#3d4758'
  background: '#f8f9ff'
  on-background: '#111c29'
  surface-variant: '#d8e3f5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-bold:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers rapid, life-critical emergency medical access across diverse urban and rural contexts in India. The design style combines **Tactile / High-Contrast Clarity** with purposeful **Soft-Edge Surfaces**, prioritizing immediate visual parsing under extreme panic, low digital literacy, and variable network environments.

- **Brand Personality**: Calm, dependable, hyper-legible, decisive, and reassuring.
- **Target Audience**: Pan-Indian citizens across diverse linguistic, socioeconomic, and network realities (2G/3G/4G/5G, low-end smartphones to desktop web).
- **Emotional Response**: Immediate clarity, elimination of decision paralysis, total trust, and direct reassurance.
- **Visual Tenet**: Function triumphs over decoration. Color is semantic and strictly controlled—emergency red commands instant recognition, while surgical teal delivers dependable clinical progression.

## Colors

The color system enforces strict semantic meaning to avoid cognitive fatigue during critical medical emergencies.

- **Primary Action (`#0E9F8E`)**: Accessible clinical teal. Reserved for standard primary interactions, location confirmation, routine confirmations, and reassuring call-to-actions.
- **Emergency & SOS (`#E53935`)**: High-luminance medical red. Reserved exclusively for SOS triggers, severe alerts, ambulance dispatches, and irreversible panic actions. Never used as general decorative accenting.
- **Text & Structure Primary (`#1A2433`)**: Deep slate navy, providing maximum contrast against white and light neutral surfaces, surpassing WCAG AAA contrast metrics.
- **Text Secondary (`#6B7685`)**: Supporting slate grey for metadata, timestamps, directional context, and secondary labels.
- **Surfaces & Backgrounds**: Base background alternates between pure white (`#FFFFFF`) for active cards/modals and light neutral grey (`#F5F7FA`) for canvas scaffolding. Structural borders use `#E2E8F0`.

## Typography

The typography system is engineered for zero ambiguity. Font families cascade systematically across Indic scripts, pairing **Inter** for Latin numerals and English headers with **Noto Sans** (including Noto Sans Devanagari, Tamil, Telugu, Bengali, Kannada, and Malayalam) for body copy and multilingual localization.

- **Minimum Body Size**: Set strictly to 16px (`body-md`) across all devices to guarantee instant legibility under glare, movement, or poor screen resolution.
- **Multilingual Script Normalization**: Line-heights for non-Latin Indic scripts receive an automatic +4px baseline safety buffer to accommodate ascenders, descenders, and complex conjuncts (matras) without truncation.
- **Numerical Clarity**: Tabular figures (`tnum`) are enforced across emergency timers, ambulance arrival estimates, and phone numbers.

## Layout & Spacing

The layout model relies on a strict **fluid-grid container system** with adaptive gutters and generous outer margins designed to prevent accidental touches along device edges.

- **Mobile (<768px)**: 4-column fluid grid, 16px gutters, 16px outer margin. Layout prioritizes single-column vertical stacking so critical decisions follow a linear path. All primary interactive elements maintain a **minimum height of 56px**.
- **Tablet (768px - 1024px)**: 8-column fluid grid, 24px gutters, 32px outer margin. Supports split-screen orientation (e.g., live map alongside triage intake card).
- **Desktop (>1024px)**: 12-column grid capped at a maximum content width of 1280px with 32px gutters and 48px outer margins.
- **Touch Target Enclosure**: Spacing tokens around actionable areas preserve a minimum 8px (`space-sm`) safety clearance between adjacent interactable zones to prevent mis-clicks during high-stress scenarios.

## Elevation & Depth

Visual hierarchy uses a hybrid of **tonal layers**, **crisp border framing**, and **diffuse ambient drop-shadows** to separate emergency controls from continuous map tracking.

- **Level 0 (Flat / Canvas)**: `#F5F7FA` neutral background with no elevation.
- **Level 1 (Card & Content Blocks)**: Pure `#FFFFFF` surface bounded by a 1px solid `#E2E8F0` border and a faint ambient shadow: `box-shadow: 0 2px 8px -2px rgba(26, 36, 51, 0.06), 0 1px 4px -1px rgba(26, 36, 51, 0.04)`.
- **Level 2 (Floating Action Modules & Map Overlays)**: Surface-level elements like map recenter controls, 2D/3D toggles, and contextual location chips use subtle glassmorphism (`backdrop-filter: blur(12px)`, background `rgba(255, 255, 255, 0.92)`, border `1px solid rgba(226, 232, 240, 0.8)`), accompanied by `box-shadow: 0 8px 24px -4px rgba(26, 36, 51, 0.12)`.
- **Level 3 (SOS Trigger & Voice Widget)**: Crucial, life-saving triggers float at maximum depth with high tactile presence. SOS triggers cast a tinted red glow (`box-shadow: 0 12px 32px -4px rgba(229, 57, 53, 0.40)`). The voice assistant widget uses `box-shadow: 0 16px 40px -6px rgba(14, 159, 142, 0.35)`.

## Shapes

The design system standardizes on a **16px base radius** (`rounded-lg` under roundedness level 2) to convey approachable, clinical safety without appearing frivolous or childlike.

- **Base Radii (`0.5rem` / 8px)**: Used for small tags, internal segmented controls, and nested list items.
- **Structural Radii (`1rem` / 16px)**: Standard for cards, modal dialogs, map frame viewports, bottom sheets, and location verification containers.
- **Pill Radii (Full Radius / `9999px`)**: Reserved strictly for high-urgency action buttons, SOS badges, status indicator chips, and the floating voice assistant widget to visually differentiate action anchors from content surfaces.

## Components

### 1. High-Clarity Top Navigation Bar
- Fixed header on `#FFFFFF` with a bottom border in `#E2E8F0`.
- Height: 64px. Contains the brand identity on the left.
- Center/Right: Prominent interactive Location Chip (`#F5F7FA` surface, 1px `#E2E8F0` border, 8px radius, showing live GPS pin + abbreviated ward/village/city).
- Compact bilingual switcher button (`हिं / EN`) with an instant modal trigger for exhaustive script selection.

### 2. Large Tactile Language Selection Buttons
- Displayed as a responsive grid of high-profile cards (minimum height: 64px).
- Dual-line text rendering: Primary localized script rendered in native glyphs at 20px bold (e.g., हिन्दी, தமிழ், తెలుగు, বাংলা) with standard English transliteration below at 13px medium (`#6B7685`).
- Active state: 2px solid `#0E9F8E` border, `#0E9F8E` at 8% tint background, high-contrast checkmark indicator.

### 3. Emergency SOS Trigger & Badges
- **SOS Button**: Full-width or central circular floating anchor. Background `#E53935`, text pure `#FFFFFF` in 20px bold uppercase. Minimum height: 64px (or 80px diameter circle). Pulsing visual beacon ring animation (`rgba(229, 57, 53, 0.25)`).
- **Urgent Status Badges**: Pill-shaped container, `#E53935` at 12% tint background with `#E53935` 1px border and bold `#E53935` text accompanied by an exclamation triangle icon.

### 4. Interactive & Standard Action Buttons
- Height: Minimum 56px touch target.
- **Primary Action**: `#0E9F8E` background, `#FFFFFF` text, 16px semi-bold, pill or 16px rounded shape. Active state scales down to 98% with deepened background tone.
- **Secondary Action**: White surface, 1.5px solid `#0E9F8E` border, `#0E9F8E` text.

### 5. Location Permission Cards
- Contained within 16px rounded cards on pure `#FFFFFF`.
- High reassurance visual hierarchy: Illustrated shield/location safety graphic, prominent `headline-sm` reassuring text ("Your exact location is shared only with verified ambulances and dispatchers"), clear address readout box, and a single, full-width 56px teal primary button ("Enable High-Accuracy GPS").

### 6. 3D Map Container & Floating Overlay Controls
- Map container features 16px rounded corners with an interior 1px stroke (`#E2E8F0`).
- Floating controls positioned with 16px inset margins:
  - **Perspective Toggle (2D/3D)**: Segmented pill toggle with blurred glass backing (`rgba(255, 255, 255, 0.9)`), 48px height, 14px bold typography.
  - **Recenter Button**: 56px circular tactile button, white background, `#1A2433` crosshair icon, 8px elevation shadow.
  - **Map Legend**: Collapsible semi-transparent drawer pinned to bottom-left displaying vehicle status (Dispatched, En Route, Arrived).

### 7. 'Talk to HelpMe' Floating Voice Assistant Widget
- Pinned bottom bar or floating pill accessible in both one-handed mobile and desktop views.
- Visuals: Clinical teal-to-emerald accent gradient or solid `#0E9F8E`, pure white text, microphone icon.
- Height: 60px.
- States:
  - **Idle**: "Talk in your language" with subtle animated mic pulse.
  - **Active Listening**: Surface expands slightly; dynamic 4-bar soundwave visualizer oscillates in `#FFFFFF`; live transcription renders in `body-bold`.

### 8. Input Fields, Checkboxes & Radio Buttons
- Form inputs maintain a 56px height, 16px text size, `#FFFFFF` surface, and 1.5px `#E2E8F0` border that transitions to `#0E9F8E` on focus (with a 3px soft-focus teal glow).
- Radios and Checkboxes feature enlarged 24x24px hit targets enclosed in a 56px full-width select row to guarantee effortless tapping for elderly users or trembling hands.
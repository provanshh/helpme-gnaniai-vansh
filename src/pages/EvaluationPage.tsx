import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  AudioLines,
  Brain,
  Droplet,
  ExternalLink,
  GitBranch,
  HeartPulse,
  Languages,
  Layers,
  MessageCircle,
  Mic,
  Network,
  CirclePlay,
  ShieldCheck,
  Siren,
  Users,
  Volume2,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { DEMO_VIDEO_URL, loadMermaid } from '@/components/evaluation/EvaluationModal';

export const GITHUB_URL = 'https://github.com/provanshh/helpme-gnaniai-vansh';

function toEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/* ------------------------------------------------------------ diagrams */

const DIAGRAMS: { id: string; title: string; sub: string; icon: LucideIcon; src: string }[] = [
  {
    id: 'flow',
    title: 'Full user workflow',
    sub: 'Speak → Gnani → agent acts → Gnani speaks',
    icon: Workflow,
    src: `flowchart TD
    A([User opens HelpMe]) --> B{How?}
    B -- "Red SOS button" --> C[SOS Agent]
    B -- "Voice on a service page" --> D[Page voice box]
    B -- "Tap a service / map" --> M[Live map + cards]
    C --> E["🎙️ Speak · Hindi / English / Hinglish"]
    D --> E
    E --> F["Gnani Prisma v3.0 · speech → text"]:::gnani
    F --> G["Agent: language + task<br/>fills every slot from one sentence"]:::agent
    G -->|"emergency · 13 types"| H["🚑 Nearest ambulance + hospital alert"]:::sos
    H --> H2["Critical banner + first-aid steps"]:::sos
    G -->|blood| I["🩸 Real blood banks + compatible donors"]
    I --> I2["Request #ID · donors alerted"]
    G -->|"hospital / doctor / pharmacy"| J["📍 Nearest place + route"]
    G -->|medicine| K["💊 Medicine info + pharmacies"]
    G -->|off-topic| X["Polite refusal"]
    D -->|"not this page"| C
    I2 --> W["💬 WhatsApp alert (demo)"]
    H --> W
    W --> W2["Accept → start code → live location → verified"]
    H2 --> Z["Gnani Timbre v2.5 · speaks reply in user's language"]:::gnani
    I2 --> Z
    J --> Z
    K --> Z
    X --> Z
    classDef gnani fill:#2e4a36,stroke:#f5a623,stroke-width:3px,color:#ffffff
    classDef agent fill:#fff3db,stroke:#f5a623,stroke-width:2px,color:#1c2820
    classDef sos fill:#ffe3e1,stroke:#e5383b,color:#1c2820`,
  },
  {
    id: 'gnani',
    title: 'Gnani voice round trip',
    sub: '1 Prisma call + 1 Timbre call per request',
    icon: AudioLines,
    src: `sequenceDiagram
    autonumber
    actor U as User
    participant B as Browser
    participant S as HelpMe server
    participant P as Gnani Prisma v3.0
    participant A as Agent engine
    participant T as Gnani Timbre v2.5
    U->>B: "Mujhe B+ blood chahiye, 2 units"
    Note over B: 16 kHz WAV · auto-stop on 1.2 s silence
    B->>S: POST /api/voice/stt (audio/wav)
    S->>P: POST /stt/v3 · prisma-v3.0 · hi-IN,en-IN · medical keyterms
    P-->>S: transcript + detected language
    S-->>B: { transcript }
    B->>A: agentStep(transcript)
    A-->>B: actions run at once + reply text
    B->>S: POST /api/voice/tts { text, lang }
    S->>T: POST /api/v1/tts/inference · timbre-v2.5 · Poorvi / Nalini / Devika
    T-->>S: WAV audio
    S-->>B: audio/wav
    B-->>U: 🔊 "Ho gaya — 4 blood banks mile, 6 donors alerted"`,
  },
  {
    id: 'arch',
    title: 'System architecture',
    sub: 'React · Express proxy · Gnani · OSM',
    icon: Network,
    src: `flowchart LR
    subgraph Client["Browser · React 19 + Vite"]
      UI["Pages: Home · SOS Agent · Services · Map · WhatsApp"]
      REC["recorder.ts · 16 kHz WAV"]
      VS["voiceService.ts · Gnani provider"]
      AG["agentEngine.ts · rule-based agent"]:::agent
      ST["Zustand stores (persist)"]
      MAP["MapLibre GL · radar · routes"]
      UI --> REC --> VS --> AG --> UI
      AG --> ST
      UI --> MAP
    end
    subgraph Server["Node + Express"]
      VR["/api/voice · status · stt · tts"]
      PR["/api/places"]
      OT["/api/ambulances · emergency · stream (SSE)"]
      MS[("Memory store / PostGIS")]
      SNAP[("OSM snapshot · 163 places")]
      OV["Overpass client · parallel mirrors"]
      PR --> MS --- SNAP
      PR --> OV
    end
    subgraph Gnani["Gnani AI · api.vachana.ai"]
      STT["Prisma v3.0 · STT"]:::gnani
      TTS["Timbre v2.5 · TTS"]:::gnani
    end
    VS -- WAV --> VR
    VR -- "X-API-Key-ID (server only)" --> STT
    VR -- "X-API-Key-ID (server only)" --> TTS
    UI --> PR
    UI --> OT
    OV --> OSM["OpenStreetMap"]
    MAP -.-> GM["Google Maps links"]
    classDef gnani fill:#2e4a36,stroke:#f5a623,stroke-width:3px,color:#ffffff
    classDef agent fill:#fff3db,stroke:#f5a623,stroke-width:2px,color:#1c2820`,
  },
  {
    id: 'agent',
    title: 'SOS agent engine',
    sub: 'Act first, ask later',
    icon: Brain,
    src: `flowchart LR
    T["Transcript from Gnani Prisma"]:::gnani --> L["nextLang()<br/>sticky Hindi / English / Hinglish"]
    L --> K["detectTask()<br/>emergency · blood · ambulance · hospital ·<br/>doctor · pharmacy · medicine"]
    K --> S["Slot filling<br/>group · units · hospital · emergency · location"]
    S --> R["agentStep() → actions run immediately<br/>no 'shall I start?'"]:::agent
    R --> O["Reply in the same language"]
    O --> V["Gnani Timbre v2.5 speaks"]:::gnani
    K -->|no match| N["Off-topic guard"]
    N --> O
    classDef gnani fill:#2e4a36,stroke:#f5a623,stroke-width:3px,color:#ffffff
    classDef agent fill:#fff3db,stroke:#f5a623,stroke-width:2px,color:#1c2820`,
  },
  {
    id: 'wa',
    title: 'WhatsApp donor flow',
    sub: 'Accept · start code · live location',
    icon: MessageCircle,
    src: `sequenceDiagram
    participant F as Family chat
    participant HM as HelpMe agent
    participant D as Donor / service chat
    HM->>F: Your blood request is live · B+ · 2 units
    HM->>D: Urgent B+ needed at Saroj Hospital · 2.6 km
    D->>HM: Accept ✅ (Reject → next compatible donor)
    HM->>F: Karan accepted · start code 1876
    HM->>D: Start code 1876 · share live location
    loop until arrival
      D-->>F: 📍 live location + ETA
    end
    F->>HM: Confirms code 1876
    HM->>F: Verified · donation started
    HM->>D: Verified · thank you 🙏`,
  },
];

function DiagramModal({ d, onClose }: { d: (typeof DIAGRAMS)[number] | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading');

  useEffect(() => {
    if (!d) return;
    let alive = true;
    setState('loading');
    loadMermaid()
      .then((m) => m.render(`eval-${d.id}-${Date.now()}`, d.src))
      .then(({ svg }) => {
        if (!alive || !ref.current) return;
        ref.current.innerHTML = svg;
        const el = ref.current.querySelector('svg');
        if (el) {
          el.removeAttribute('height');
          el.style.maxWidth = '100%';
          el.style.maxHeight = '100%';
          el.style.width = 'auto';
          el.style.height = '100%';
        }
        setState('ok');
      })
      .catch(() => alive && setState('err'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      window.removeEventListener('keydown', onKey);
    };
  }, [d, onClose]);

  return createPortal(
    <AnimatePresence>
      {d && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-dark/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex h-[88vh] w-[min(1280px,94vw)] flex-col overflow-hidden rounded-3xl border-4 border-accent bg-surface shadow-2xl"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border bg-primary px-6 py-4 text-white">
              <d.icon className="size-6 text-accent" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold">{d.title}</h3>
                <p className="text-[13px] text-white/70">{d.sub}</p>
              </div>
              <button
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-[radial-gradient(#dde5d8_1px,transparent_1px)] bg-[length:18px_18px] p-6">
              {state === 'loading' && (
                <p className="absolute inset-0 grid place-items-center text-sm text-text-secondary">Drawing diagram…</p>
              )}
              {state === 'err' && (
                <p className="absolute inset-0 grid place-items-center text-sm text-text-secondary">
                  Diagram needs internet to load (Mermaid CDN).
                </p>
              )}
              <div ref={ref} className="flex h-full w-full items-center justify-center" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------------------------------------ content */

const IMPACT = [
  { n: '474', l: 'road-crash deaths every day', s: 'MoRTH 2023' },
  { n: '~50k', l: 'deaths/yr preventable with timely care', s: 'AIIMS-led committee' },
  { n: '14.6M', l: 'blood units needed every year', s: 'Govt. of India, 2025' },
  { n: '~10.6%', l: 'of Indians speak English', s: 'Census 2011' },
];

const ABOUT: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Siren, t: 'SOS agent', d: '13 emergency types · ambulance + first aid at once' },
  { icon: Droplet, t: 'Blood', d: 'Real blood banks + compatible donors alerted' },
  { icon: HeartPulse, t: 'Care nearby', d: 'Hospitals, doctors, pharmacies on a live OSM map' },
  { icon: MessageCircle, t: 'WhatsApp (demo)', d: 'Accept · start code · live location' },
];

const GNANI_USES = [
  'SOS agent: every turn, in and out',
  'Voice box on all 5 service pages',
  'AI helper greets and answers in Hinglish',
  'First aid read aloud until help arrives',
];

const STACK = ['React 19', 'TypeScript', 'Vite 8', 'Tailwind v4', 'Zustand', 'Framer Motion', 'MapLibre', 'Express', 'OpenStreetMap', 'Mermaid'];

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`min-h-0 rounded-3xl border border-border bg-surface p-4 shadow-sm xl:p-5 ${className}`}>{children}</div>;
}

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase ${light ? 'text-accent' : 'text-primary'}`}>
      <span className="h-[3px] w-5 rounded-full bg-accent" />
      {children}
    </p>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/* ------------------------------------------------------------ page */

export function EvaluationPage() {
  const [open, setOpen] = useState<(typeof DIAGRAMS)[number] | null>(null);
  const embed = DEMO_VIDEO_URL ? toEmbed(DEMO_VIDEO_URL) : null;

  useEffect(() => {
    document.title = 'HelpMe · Evaluation';
  }, []);

  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-bg p-3 text-text lg:h-dvh lg:overflow-hidden xl:gap-4 xl:p-4">
      {/* ── header */}
      <header className="flex shrink-0 flex-wrap items-center gap-3 rounded-3xl bg-primary px-5 py-3 text-white">
        <div className="grid size-11 place-items-center rounded-full bg-accent text-primary-dark">
          <HeartPulse className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl leading-tight font-bold xl:text-2xl">
            HelpMe <span className="font-normal text-white/60">·</span>{' '}
            <span className="text-accent italic">Evaluation</span>
          </h1>
          <p className="truncate text-[12px] text-white/70 xl:text-[13px]">
            Emergency medical help for India, one sentence away · Gnani AI Great Indian AI Internship Challenge
          </p>
        </div>
        <div className="hidden text-right text-[12px] leading-tight md:block">
          <p className="font-semibold">Vansh Singla</p>
          <p className="text-white/70">vs.vansh19@gmail.com</p>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-dark hover:bg-accent-soft"
        >
          <GithubMark /> GitHub
        </a>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent hover:bg-accent-dark"
        >
          Open app <ArrowRight className="size-4" />
        </Link>
      </header>

      {/* ── body grid */}
      <main className="grid min-h-0 flex-1 gap-3 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto] xl:gap-4">
        {/* video */}
        <Card className="flex flex-col lg:col-span-5">
          <Eyebrow>Demo video</Eyebrow>
          <div className="relative aspect-video w-full shrink overflow-hidden rounded-2xl bg-primary-dark">
            {embed ? (
              <iframe
                className="absolute inset-0 size-full"
                src={embed}
                title="HelpMe demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#3b5e45,#1f3626)] text-center text-white">
                <div>
                  <CirclePlay className="mx-auto size-16 text-accent" />
                  <p className="mt-3 font-display text-lg font-bold">3-minute explainer</p>
                  <p className="text-[13px] text-white/70">Video link coming soon</p>
                </div>
              </div>
            )}
          </div>
          {DEMO_VIDEO_URL && (
            <a
              href={DEMO_VIDEO_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-1 self-start text-[12px] font-semibold text-primary hover:underline"
            >
              Watch on YouTube <ExternalLink className="size-3" />
            </a>
          )}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="group mt-3 flex min-h-0 flex-1 items-center gap-3 rounded-2xl bg-primary-dark px-4 py-3 text-white transition hover:bg-primary"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary-dark">
              <GithubMark />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[11px] font-bold tracking-[0.14em] text-accent uppercase">Source code</b>
              <span className="block truncate font-display text-[15px] font-bold">github.com/provanshh/helpme-gnaniai-vansh</span>
              <span className="block truncate font-mono text-[11px] text-white/60 [@media(max-height:820px)]:hidden">npm i · npm run dev:server · npm run dev</span>
            </span>
            <ExternalLink className="size-4 text-white/60 group-hover:text-accent" />
          </a>
        </Card>

        {/* about + impact */}
        <div className="flex min-h-0 flex-col gap-3 lg:col-span-3 xl:gap-4">
          <Card className="flex-1 overflow-hidden">
            <Eyebrow>What is HelpMe</Eyebrow>
            <p className="mb-3 text-[13px] leading-snug text-text-muted xl:text-sm [@media(max-height:820px)]:mb-2 [@media(max-height:820px)]:text-[12px]">
              A voice-first emergency agent. Say one sentence in <b>Hindi, English or Hinglish</b>: it finds care,
              dispatches help and talks back. <b>No typing, no reading, no confirmation loops.</b>
            </p>
            <ul className="grid gap-2 [@media(max-height:820px)]:grid-cols-2 [@media(max-height:820px)]:gap-1.5">
              {ABOUT.map((a) => (
                <li key={a.t} className="flex items-start gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary [@media(max-height:820px)]:size-7">
                    <a.icon className="size-4" />
                  </span>
                  <span className="text-[12.5px] leading-tight">
                    <b className="block text-text">{a.t}</b>
                    <span className="text-text-secondary [@media(max-height:820px)]:hidden">{a.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="shrink-0 !bg-primary-dark text-white">
            <Eyebrow light>Impact: why it matters</Eyebrow>
            <div className="grid grid-cols-2 gap-2">
              {IMPACT.map((s) => (
                <div key={s.n} className="rounded-2xl bg-white/8 p-2.5">
                  <p className="font-display text-xl font-bold text-accent xl:text-2xl">{s.n}</p>
                  <p className="text-[11px] leading-tight text-white/85">{s.l}</p>
                  <p className="mt-0.5 text-[9.5px] text-white/50">{s.s}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* gnani + workflows */}
        <div className="flex min-h-0 flex-col gap-3 lg:col-span-4 xl:gap-4">
          <Card className="shrink-0 border-2 !border-accent">
            <Eyebrow>How Gnani AI is used</Eyebrow>
            <div className="flex items-stretch gap-1.5">
              {[
                { icon: Mic, t: 'Prisma v3.0', d: 'Speech → text · hi-IN,en-IN + medical keyterms', g: true },
                { icon: Brain, t: 'HelpMe agent', d: 'Understands, acts at once', g: false },
                { icon: Volume2, t: 'Timbre v2.5', d: 'Text → speech · Nalini · Devika · Poorvi', g: true },
              ].map((s, i) => (
                <div key={s.t} className="flex flex-1 items-center gap-1.5">
                  <div
                    className={`flex h-full flex-1 flex-col rounded-2xl p-2.5 ${s.g ? 'bg-primary text-white ring-2 ring-accent' : 'bg-accent-soft text-text'}`}
                  >
                    <s.icon className={`size-5 ${s.g ? 'text-accent' : 'text-accent-dark'}`} />
                    <p className="mt-1 font-display text-[13px] font-bold">{s.g ? `Gnani ${s.t}` : s.t}</p>
                    <p className={`text-[10.5px] leading-tight ${s.g ? 'text-white/75' : 'text-text-secondary'}`}>{s.d}</p>
                  </div>
                  {i < 2 && <ArrowRight className="size-4 shrink-0 text-outline" />}
                </div>
              ))}
            </div>
            <p className="mt-2.5 rounded-xl bg-primary-dark px-3 py-2 text-center text-[12.5px] font-bold text-accent">
              Every voice request = 1 Prisma call + 1 Timbre call
            </p>
            <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 [@media(max-height:820px)]:hidden">
              {GNANI_USES.map((u) => (
                <li key={u} className="flex gap-1.5 text-[11.5px] leading-tight text-text-muted">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" /> {u}
                </li>
              ))}
            </ul>
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10.5px] font-semibold">
              <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-primary">
                <Languages className="size-3" /> Hindi · English · Hinglish
              </span>
              <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-primary">
                <ShieldCheck className="size-3" /> API key server-side only
              </span>
            </div>
          </Card>

          <Card className="flex flex-1 flex-col">
            <Eyebrow>Workflow & architecture: tap to open</Eyebrow>
            <div className="grid min-h-0 flex-1 auto-rows-fr gap-2 [@media(max-height:820px)]:grid-cols-2 [@media(max-height:820px)]:gap-1.5">
              {DIAGRAMS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setOpen(d)}
                  className="group flex min-h-0 items-center gap-3 [@media(max-height:820px)]:gap-2 rounded-2xl border border-border bg-surface-low px-3 text-left transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-accent">
                    <d.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="line-clamp-2 block text-[13px] leading-tight text-text [@media(max-height:820px)]:text-[12px]">{d.title}</b>
                    <span className="block truncate text-[11px] text-text-secondary [@media(max-height:820px)]:hidden">{d.sub}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-outline transition group-hover:translate-x-0.5 group-hover:text-accent-dark [@media(max-height:820px)]:hidden" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* bottom strip */}
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-surface px-4 py-2.5 lg:col-span-12">
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-primary uppercase">
            <Layers className="size-4" /> Stack
          </span>
          <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-accent">Gnani Prisma + Timbre</span>
          {STACK.map((s) => (
            <span key={s} className="rounded-full bg-surface-low px-2.5 py-1 text-[11px] font-semibold text-text-muted">
              {s}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-3 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> Donors, ambulances & WhatsApp are demo simulations
            </span>
            <span className="hidden items-center gap-1 xl:flex">
              <GitBranch className="size-3.5" /> Next: Bolna.ai live phone calls
            </span>
          </span>
        </div>
      </main>

      <DiagramModal d={open} onClose={() => setOpen(null)} />
    </div>
  );
}

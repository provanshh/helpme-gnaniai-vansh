export type VoiceToolName =
  | 'findBlood'
  | 'findPlaces'
  | 'requestAmbulance'
  | 'sendAlert'
  | 'switchLanguage';

export interface VoiceToolCall {
  name: VoiceToolName;
  args: Record<string, string>;
}

export interface VoiceResult {
  transcript: string;
  reply: string;
  tools: VoiceToolCall[];
}

export interface VoiceService {
  startListening(lang: string): Promise<string>;
  speak(text: string, lang: string): Promise<void>;
  interpret(transcript: string): VoiceResult;
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecCtor = new () => SpeechRec;

function mockInterpret(transcript: string): VoiceResult {
  const t = transcript.toLowerCase();
  if (t.includes('hospital') || t.includes('अस्पताल')) {
    return {
      transcript,
      reply: 'Showing nearby hospitals on the map.',
      tools: [{ name: 'findPlaces', args: { kind: 'hospital' } }],
    };
  }
  if (t.includes('pharmacy') || t.includes('medicine') || t.includes('दवा')) {
    return {
      transcript,
      reply: 'Filtering pharmacies near you.',
      tools: [{ name: 'findPlaces', args: { kind: 'pharmacy' } }],
    };
  }
  if (t.includes('ambulance') || t.includes('एम्बुलेंस') || t.includes('bulao')) {
    return {
      transcript,
      reply: 'Requesting the nearest available ambulance.',
      tools: [{ name: 'requestAmbulance', args: {} }],
    };
  }
  if (t.includes('blood') || t.includes('रक्त') || t.includes('b+') || t.includes('o-')) {
    const group = t.includes('o-') ? 'O-' : t.includes('b+') ? 'B+' : 'B+';
    return {
      transcript,
      reply: `Searching for ${group} blood donors and banks.`,
      tools: [{ name: 'findBlood', args: { group } }],
    };
  }
  if (t.includes('hindi') || t.includes('हिंदी')) {
    return {
      transcript,
      reply: 'Switching language to Hindi.',
      tools: [{ name: 'switchLanguage', args: { lang: 'hi' } }],
    };
  }
  if (t.includes('english')) {
    return {
      transcript,
      reply: 'Switching language to English.',
      tools: [{ name: 'switchLanguage', args: { lang: 'en' } }],
    };
  }
  return {
    transcript,
    reply: 'I can find hospitals, blood, pharmacies, or call an ambulance. Try saying “show hospitals”.',
    tools: [],
  };
}

export const webSpeechVoiceService: VoiceService = {
  startListening(lang) {
    return new Promise((resolve, reject) => {
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecCtor;
        webkitSpeechRecognition?: SpeechRecCtor;
      };
      const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!SR) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }
      const rec = new SR();
      rec.lang = lang.startsWith('hi') ? 'hi-IN' : 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        resolve(ev.results[0]?.[0]?.transcript ?? '');
      };
      rec.onerror = () => reject(new Error('Listening failed'));
      rec.start();
    });
  },
  async speak(text, lang) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang.startsWith('hi') ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  },
  interpret: mockInterpret,
};

export const voiceService: VoiceService = webSpeechVoiceService;

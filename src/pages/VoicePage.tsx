import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, EmergencyBanner, Icon } from '@/components/ui';
import { voiceService } from '@/services/voice/voiceService';
import { useAppStore } from '@/store/appStore';

const suggestions = [
  { labelKey: 'voice.chipHospitals', text: 'show hospitals' },
  { labelKey: 'voice.chipBlood', text: 'B+ blood chahiye' },
  { labelKey: 'voice.chipAmbulance', text: 'ambulance bulao' },
];

export function VoicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const voiceState = useAppStore((s) => s.voiceState);
  const setVoiceState = useAppStore((s) => s.setVoiceState);
  const setVoiceCopy = useAppStore((s) => s.setVoiceCopy);
  const transcript = useAppStore((s) => s.voiceTranscript);
  const reply = useAppStore((s) => s.voiceReply);
  const setActiveFilters = useAppStore((s) => s.setActiveFilters);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [typed, setTyped] = useState('');

  const runTranscript = async (text: string) => {
    setVoiceState('understanding');
    const result = voiceService.interpret(text);
    setVoiceCopy(result.transcript, result.reply);
    for (const tool of result.tools) {
      if (tool.name === 'findPlaces' && tool.args.kind === 'hospital') {
        setActiveFilters(['hospital']);
        navigate('/hospitals');
      }
      if (tool.name === 'findPlaces' && tool.args.kind === 'pharmacy') {
        setActiveFilters(['pharmacy']);
        navigate('/pharmacy');
      }
      if (tool.name === 'findBlood') {
        setActiveFilters(['blood_bank', 'donor']);
        navigate('/blood');
      }
      if (tool.name === 'requestAmbulance') navigate('/ambulance');
      if (tool.name === 'switchLanguage' && tool.args.lang) setLanguage(tool.args.lang);
    }
    setVoiceState('speaking');
    await voiceService.speak(result.reply, i18n.language);
    setVoiceState('idle');
  };

  const listen = async () => {
    try {
      setVoiceState('listening');
      const text = await voiceService.startListening(i18n.language);
      await runTranscript(text);
    } catch {
      setVoiceState('error');
      setVoiceCopy('', t('voice.error'));
      window.setTimeout(() => setVoiceState('idle'), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 pb-3 text-center">
      <h1 className="w-full text-left font-[family-name:var(--font-sans)] text-sm font-bold">
        {t('pages.voice')}
      </h1>
      <EmergencyBanner />
      <motion.button
        type="button"
        aria-label={t('voice.idle')}
        onClick={() => void listen()}
        whileTap={{ scale: 0.96 }}
        className="relative flex h-36 w-36 items-center justify-center rounded-full bg-primary text-on-primary shadow-[var(--shadow-voice)]"
      >
        {voiceState === 'listening' && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
        <Icon name="mic" size={48} strokeWidth={1.75} />
      </motion.button>
      <p className="text-[12px] font-semibold text-primary">
        {voiceState === 'listening'
          ? t('voice.listening')
          : voiceState === 'understanding'
            ? t('voice.understanding')
            : voiceState === 'speaking'
              ? t('voice.speaking')
              : t('home.talkSub')}
      </p>
      {(transcript || reply) && (
        <div className="w-full space-y-2 rounded-[var(--radius-lg)] bg-surface p-3 text-left shadow-[var(--shadow-card)]">
          {transcript && (
            <p className="text-[12px] text-text-secondary">
              <span className="font-semibold text-text">You:</span> {transcript}
            </p>
          )}
          {reply && (
            <p className="text-sm">
              <span className="font-semibold text-primary">HelpMe:</span> {reply}
            </p>
          )}
        </div>
      )}
      <div className="flex w-full flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s.text}
            type="button"
            onClick={() => void runTranscript(s.text)}
            className="rounded-full bg-surface-low px-3 py-2 text-[12px] font-semibold text-text"
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>
      <div className="flex w-full gap-2">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={t('voice.placeholder')}
          className="h-10 flex-1 rounded-[var(--radius-lg)] bg-surface-low px-3 text-[13px] outline-none"
        />
        <Button
          onClick={() => {
            if (!typed.trim()) return;
            void runTranscript(typed.trim());
            setTyped('');
          }}
        >
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
}

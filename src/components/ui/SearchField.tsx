import { Icon } from './Icon';

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onVoice?: () => void;
}

export function SearchField({ value, onChange, placeholder, onVoice }: SearchFieldProps) {
  return (
    <div className="relative flex items-center">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 text-text-secondary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-surface-low pl-9 pr-11 text-[13px] text-text outline-none transition placeholder:text-text-secondary focus:bg-surface focus:shadow-[var(--shadow-card)]"
      />
      {onVoice && (
        <button
          type="button"
          aria-label="Voice search"
          onClick={onVoice}
          className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-high text-primary"
        >
          <Icon name="mic" size={15} />
        </button>
      )}
    </div>
  );
}

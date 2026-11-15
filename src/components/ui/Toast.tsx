import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';
import { Icon } from './Icon';

type ToastItem = { id: string; message: string; tone?: 'info' | 'success' | 'danger' };

interface ToastStore {
  items: ToastItem[];
  push: (message: string, tone?: ToastItem['tone']) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (message, tone = 'info') => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { id, message, tone }] }));
    window.setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[80] flex flex-col items-center gap-1.5 px-3">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex min-h-9 max-w-md items-center gap-2 rounded-xl bg-text px-3 py-2 text-[12px] font-medium text-white shadow-[var(--shadow-float)]"
            role="status"
          >
            <Icon
              name={item.tone === 'danger' ? 'alertTriangle' : 'checkCircle'}
              size={15}
              className={item.tone === 'danger' ? 'text-sos' : 'text-primary-fixed'}
            />
            <span className="flex-1">{item.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
              <Icon name="x" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

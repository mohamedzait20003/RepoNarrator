import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface StoreState {
  mode: Theme;
  toggleMode: () => void;
  setMode: (mode: Theme) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'reponarrator-store' },
  ),
);

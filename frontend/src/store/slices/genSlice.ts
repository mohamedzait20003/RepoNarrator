import type { ModeType } from "@/lib/models/genModel";

export interface GenSlice {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  toggleMode: () => void;
}

export const CreateGenSlice = (set: any): GenSlice => ({
  mode: "light",

  setMode: (mode) => set({ mode }),

  toggleMode: () =>
    set((state: GenSlice) => ({
      mode: state.mode === "light" ? "dark" : "light",
    })),
});

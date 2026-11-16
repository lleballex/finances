import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccountingMode } from "@/features/dashboard/dashboard-data";

export const useAccountingMode = create<{
  mode: AccountingMode;
  setMode: (mode: AccountingMode) => void;
}>()(
  persist((set) => ({ mode: "date", setMode: (mode) => set({ mode }) }), {
    name: "finances-accounting-mode",
    skipHydration: true,
  }),
);

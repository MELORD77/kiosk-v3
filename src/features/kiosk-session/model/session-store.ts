import { create } from 'zustand';

interface KioskSessionState {
  sessionId: number;
  isActive: boolean;
  signal: AbortSignal;
  startSession: () => void;
  endSession: () => void;
}

let controller = new AbortController();

function rotateController() {
  controller.abort();
  controller = new AbortController();
  return controller.signal;
}

export const useKioskSessionStore = create<KioskSessionState>((set) => ({
  sessionId: 0,
  isActive: false,
  signal: controller.signal,
  startSession: () =>
    set((state) => ({
      sessionId: state.sessionId + 1,
      isActive: true,
      signal: rotateController(),
    })),
  endSession: () =>
    set((state) => ({
      sessionId: state.sessionId + 1,
      isActive: false,
      signal: rotateController(),
    })),
}));

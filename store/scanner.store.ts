import { create } from "zustand";

type ScannerStep = "idle" | "selected" | "processing" | "ready";

type ScannerState = {
  selectedImage: File | null;
  previewUrl: string | null;
  ocrText: string;
  candidates: string[];
  selectedCandidate: string;
  step: ScannerStep;
  setSelectedImage: (file: File | null, previewUrl: string | null) => void;
  setOcrResult: (payload: { text: string; candidates: string[] }) => void;
  setSelectedCandidate: (value: string) => void;
  setStep: (value: ScannerStep) => void;
  reset: () => void;
};

const initialState = {
  selectedImage: null,
  previewUrl: null,
  ocrText: "",
  candidates: [] as string[],
  selectedCandidate: "",
  step: "idle" as ScannerStep,
};

export const useScannerStore = create<ScannerState>((set) => ({
  ...initialState,
  setSelectedImage: (file, previewUrl) =>
    set({
      selectedImage: file,
      previewUrl,
      step: file ? "selected" : "idle",
      ocrText: "",
      candidates: [],
      selectedCandidate: "",
    }),
  setOcrResult: ({ text, candidates }) =>
    set({
      ocrText: text,
      candidates,
      selectedCandidate: candidates[0] ?? "",
      step: "ready",
    }),
  setSelectedCandidate: (value) => set({ selectedCandidate: value }),
  setStep: (value) => set({ step: value }),
  reset: () => set(initialState),
}));

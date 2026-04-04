"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useScannerStore } from "@/store/scanner.store";

type OcrCandidatePickerProps = {
  manualValue: string;
  setManualValue: Dispatch<SetStateAction<string>>;
};

export function OcrCandidatePicker({
  manualValue,
  setManualValue,
}: OcrCandidatePickerProps) {
  const candidates = useScannerStore((state) => state.candidates);
  const selectedCandidate = useScannerStore((state) => state.selectedCandidate);
  const setSelectedCandidate = useScannerStore((state) => state.setSelectedCandidate);
  const ocrText = useScannerStore((state) => state.ocrText);
  const step = useScannerStore((state) => state.step);

  useEffect(() => {
    if (selectedCandidate && !manualValue) {
      setManualValue(selectedCandidate);
    }
  }, [manualValue, selectedCandidate, setManualValue]);

  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Check The Number
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Make sure the number looks right</h2>
        </div>

        {step === "ready" && candidates.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {candidates.map((candidate) => (
              <Button
                key={candidate}
                type="button"
                variant={candidate === selectedCandidate ? "default" : "secondary"}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setManualValue(candidate);
                }}
              >
                {candidate}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="nafdac-number">
            NAFDAC number
          </label>
          <Input
            id="nafdac-number"
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            placeholder="Type or correct the NAFDAC number"
          />
        </div>

        {step === "ready" && candidates.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                We could not find a clear number from the photo. You can type it yourself and continue.
              </div>
            </div>
          </div>
        ) : null}

        {ocrText ? (
          <details className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              See what was read from the image
            </summary>
            <pre className="mt-3 whitespace-pre-wrap font-sans">{ocrText}</pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  );
}

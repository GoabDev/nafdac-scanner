"use client";

import { ChangeEvent, useState } from "react";
import { Camera, LoaderCircle, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExtractNafdacMutation } from "@/queries/extract-nafdac.query";
import { runNafdacOcr } from "@/services/client/ocr.service";
import { useScannerStore } from "@/store/scanner.store";

export function ScannerUpload() {
  const setSelectedImage = useScannerStore((state) => state.setSelectedImage);
  const setOcrResult = useScannerStore((state) => state.setOcrResult);
  const setStep = useScannerStore((state) => state.setStep);
  const step = useScannerStore((state) => state.step);
  const previewUrl = useScannerStore((state) => state.previewUrl);
  const selectedImage = useScannerStore((state) => state.selectedImage);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("Waiting for image");
  const extractMutation = useExtractNafdacMutation();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setOcrError(null);
    setOcrProgress(0);
    setOcrStatus("Photo selected");
    setSelectedImage(file, URL.createObjectURL(file));
  }

  async function handleRunOcr() {
    if (!selectedImage) {
      return;
    }

    setOcrError(null);
    setStep("processing");
    setOcrProgress(0);
    setOcrStatus("Reading the photo");

    try {
      setOcrProgress(0.2);
      const result = await extractMutation.mutateAsync(selectedImage);

      if (result.candidates.length > 0) {
        setOcrResult({
          text: result.text,
          candidates: result.candidates.map((candidate) => candidate.value),
        });
        setOcrProgress(1);
        setOcrStatus(
          result.provider === "openrouter" ? "Number found" : "Number found",
        );
        return;
      }

      setOcrStatus("We could not find a clear match, trying another method");
      setOcrProgress(0.45);

      const fallback = await runNafdacOcr(selectedImage, (progress, status) => {
        setOcrProgress(0.45 + progress * 0.55);
        setOcrStatus(`Local OCR: ${status}`);
      });

      setOcrResult({
        text: [result.text, fallback.text].filter(Boolean).join("\n"),
        candidates: fallback.candidates.map((candidate) => candidate.value),
      });
      setOcrProgress(1);
      setOcrStatus("Scan complete");
      setOcrError(result.message ?? null);
    } catch {
      try {
        setOcrStatus("Trying another way to read the photo");
        setOcrProgress(0.35);

        const fallback = await runNafdacOcr(selectedImage, (progress, status) => {
          setOcrProgress(0.35 + progress * 0.65);
          setOcrStatus(`Local OCR: ${status}`);
        });

        setOcrResult({
          text: fallback.text,
          candidates: fallback.candidates.map((candidate) => candidate.value),
        });
        setOcrProgress(1);
        setOcrStatus("Scan complete");
        setOcrError(
          extractMutation.error instanceof Error
            ? extractMutation.error.message
            : "We used a backup scanner to read the photo.",
        );
      } catch {
        setStep("selected");
        setOcrResult({ text: "", candidates: [] });
        setOcrProgress(0);
        setOcrStatus("Could not read the photo");
        setOcrError(
          "We could not read the number from this photo. Try another photo or enter the number yourself.",
        );
      }
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Scan Label
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Start with a clear photo</h2>
          </div>
          <div className="rounded-2xl bg-muted p-3 text-primary">
            <ScanSearch className="size-6" />
          </div>
        </div>

        {!selectedImage ? (
          <label className="block cursor-pointer rounded-[24px] border border-dashed border-primary/35 bg-primary/5 p-6 text-center hover:bg-primary/8">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <Camera className="mx-auto mb-4 size-7 text-primary" />
            <p className="text-base font-medium">Tap to take a photo or upload one</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure the NAFDAC number is easy to see on the label.
            </p>
            <div className="mt-5">
              <span className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground">
                Add photo
              </span>
            </div>
          </label>
        ) : null}

        {previewUrl ? (
          <div className="overflow-hidden rounded-[24px] border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected product label"
              className="h-64 w-full object-cover"
            />
          </div>
        ) : null}

        {selectedImage ? (
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleRunOcr} disabled={step === "processing"}>
              {step === "processing" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Reading photo
                </>
              ) : (
                "Find NAFDAC number"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOcrError(null);
                setOcrProgress(0);
                setOcrStatus("Waiting for image");
                setSelectedImage(null, null);
              }}
            >
              Remove photo
            </Button>
          </div>
        ) : null}

        {step === "processing" ? (
          <div className="space-y-3 rounded-2xl bg-muted px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>We are scanning the photo.</span>
              <span className="font-medium text-foreground">
                {Math.round(ocrProgress * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(8, Math.round(ocrProgress * 100))}%` }}
              />
            </div>
            <p>
              Current step: <span className="font-medium text-foreground">{ocrStatus}</span>
            </p>
          </div>
        ) : null}

        {step === "selected" ? (
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Your photo is ready. Click <span className="font-medium text-foreground">Find NAFDAC number</span> to continue.
          </div>
        ) : null}

        {step === "ready" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            We found something. Check the suggested number below before you continue.
          </div>
        ) : null}

        {selectedImage && step !== "processing" ? (
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            If the photo is unclear, you can still type the number yourself below.
          </div>
        ) : null}

        {ocrError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {ocrError}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

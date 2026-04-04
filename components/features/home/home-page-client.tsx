"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { LookupHistory } from "@/components/features/history/lookup-history";
import { OcrCandidatePicker } from "@/components/features/scanner/ocr-candidate-picker";
import { ScannerUpload } from "@/components/features/scanner/scanner-upload";
import { VerifyEmptyState } from "@/components/features/verify/verify-empty-state";
import { VerifyForm } from "@/components/features/verify/verify-form";
import { VerificationResultModal } from "@/components/features/verify/verification-result-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLookupHistory, saveLookupHistoryItem } from "@/lib/history-storage";
import { useVerifyNafdacMutation } from "@/queries/verify-nafdac.query";
import { LookupHistoryItem } from "@/schemas/history.schema";

export function HomePageClient() {
  const [manualValue, setManualValue] = useState("");
  const [historyItems, setHistoryItems] = useState<LookupHistoryItem[]>(() =>
    typeof window === "undefined" ? [] : getLookupHistory(),
  );
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const verifyMutation = useVerifyNafdacMutation();

  function handleVerify(number: string) {
    setVerificationError(null);
    setResultModalOpen(true);

    verifyMutation.mutate(number, {
      onSuccess: (result) => {
        if (result.status !== "verified" || !result.product) {
          return;
        }

        saveLookupHistoryItem({
          id: String(result.product.id),
          name: result.product.name,
          nafdacNumber: result.product.nafdacNumber,
          category: result.product.category,
          checkedAt: new Date().toISOString(),
          status: "verified",
        });

        setHistoryItems(getLookupHistory());
      },
      onError: (error) => {
        setVerificationError(
          error instanceof Error
            ? error.message
            : "We couldn’t check that number right now. Please try again.",
        );
      },
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Card className="relative overflow-hidden bg-[linear-gradient(135deg,#0b8f47,#0a6f39)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:p-10">
          <div>
            <Badge className="bg-white/16 text-white">NAFDAC Product Checker</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Snap the label, find the NAFDAC number, and check the product in seconds.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Upload a clear photo of the product label and we will help you find the
              NAFDAC number. You can review it, make changes if needed, and check the
              product without leaving this page.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/12 bg-white/8 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/12 p-3">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Powered By
                </p>
                <p className="mt-1 text-lg font-semibold">NAFDAC Greenbook</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Your recent checks are saved on this device, so it is easy to go back to
              a product you already looked up.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <ScannerUpload />
          <OcrCandidatePicker manualValue={manualValue} setManualValue={setManualValue} />
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Check Product
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Enter the number if needed</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  If the number on the label is not picked up correctly, type it here
                  yourself before you continue.
                </p>
              </div>

              <VerifyForm
                initialValue={manualValue}
                onValueChange={setManualValue}
                onSubmit={handleVerify}
                isPending={verifyMutation.isPending}
              />
            </CardContent>
          </Card>

          <VerifyEmptyState
            title="Nothing checked yet"
            description="Upload a product photo or type a NAFDAC number to get started. Your result will open in a pop-up as soon as the check is complete."
          />

          <LookupHistory items={historyItems} onSelect={setManualValue} />
        </div>
      </section>

      <VerificationResultModal
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        isLoading={verifyMutation.isPending}
        errorMessage={verificationError}
        result={verifyMutation.data ?? null}
      />
    </main>
  );
}

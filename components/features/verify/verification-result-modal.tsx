"use client";

import { ReactNode, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  SearchX,
} from "lucide-react";
import { VerifyResultCard } from "@/components/features/verify/verify-result-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OFFICIAL_REGISTRATION_PORTAL } from "@/lib/constants";
import { VerifyNafdacResponse } from "@/schemas/nafdac.schema";

type VerificationResultModalProps = {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  result: VerifyNafdacResponse | null;
};

export function VerificationResultModal({
  open,
  onClose,
  isLoading,
  errorMessage,
  result,
}: VerificationResultModalProps) {
  const fallbackNumber = result?.normalizedNumber?.trim() || "";
  const showManualFallback =
    !isLoading &&
    !errorMessage &&
    (result?.status === "not_found" || result?.status === "unavailable") &&
    Boolean(fallbackNumber);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Check Result"
      description="Here is the result of your product check."
      className="max-w-4xl"
    >
      {isLoading ? (
        <StatePanel
          icon={<LoaderCircle className="size-7 animate-spin text-primary" />}
          title="Checking product"
          description="Please wait while we check this number in the official NAFDAC database."
        />
      ) : null}

      {!isLoading && errorMessage ? (
        <StatePanel
          icon={<AlertTriangle className="size-7 text-danger" />}
          title="Something went wrong"
          description={errorMessage}
        />
      ) : null}

      {!isLoading && !errorMessage && result?.status === "verified" ? (
        <VerifyResultCard result={result} compact />
      ) : null}

      {!isLoading && !errorMessage && result?.status === "not_found" ? (
        <StatePanel
          icon={<SearchX className="size-7 text-secondary" />}
          title="Product not found"
          description={
            result.message ??
            "We could not find a matching product for this number."
          }
        />
      ) : null}

      {!isLoading && !errorMessage && result?.status === "invalid_input" ? (
        <StatePanel
          icon={<AlertTriangle className="size-7 text-secondary" />}
          title="Check the number and try again"
          description={result.message ?? "Please enter a valid NAFDAC number."}
        />
      ) : null}

      {!isLoading && !errorMessage && result?.status === "unavailable" ? (
        <StatePanel
          icon={<AlertTriangle className="size-7 text-danger" />}
          title="Service unavailable"
          description={
            result.message ??
            "We cannot reach the verification service right now. Please try again shortly."
          }
        />
      ) : null}

      {!isLoading && !errorMessage && !result ? (
        <StatePanel
          icon={<CheckCircle2 className="size-7 text-primary" />}
          title="No result yet"
          description="Your result will appear here after you check a product."
        />
      ) : null}

      {showManualFallback ? (
        <ManualFallbackPanel key={fallbackNumber} fallbackNumber={fallbackNumber} />
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

function ManualFallbackPanel({ fallbackNumber }: { fallbackNumber: string }) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  async function handleCopyFallbackNumber() {
    try {
      await navigator.clipboard.writeText(fallbackNumber);
      setCopyFeedback("Number copied. Paste it into the official portal.");
    } catch {
      setCopyFeedback("Copy failed. Please select and copy the number manually.");
    }
  }

  function handleOpenOfficialPortal() {
    window.open(OFFICIAL_REGISTRATION_PORTAL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-5 rounded-[28px] border border-border bg-card px-5 py-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Manual Fallback
        </p>
        <h3 className="text-xl font-semibold">Continue on the official portal</h3>
        <p className="text-sm leading-7 text-muted-foreground">
          The official NAFDAC registration portal requires a CAPTCHA, so we cannot
          submit the fallback automatically from this app. Copy the number below,
          open the portal, paste it, then click Verify.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-muted px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          NAFDAC Number
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[0.08em]">{fallbackNumber}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={handleCopyFallbackNumber}>
          <Copy className="size-4" />
          Copy number
        </Button>
        <Button type="button" onClick={handleOpenOfficialPortal}>
          <ExternalLink className="size-4" />
          Open official portal
        </Button>
      </div>

      {copyFeedback ? (
        <p className="mt-3 text-sm text-muted-foreground">{copyFeedback}</p>
      ) : null}
    </div>
  );
}

function StatePanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-border bg-muted/65 px-6 py-10 text-center">
      <div className="rounded-full bg-white p-4 shadow-sm">{icon}</div>
      <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}

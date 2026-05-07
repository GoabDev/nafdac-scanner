"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
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
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  function clearPendingRedirect() {
    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }

  function cancelRedirect() {
    clearPendingRedirect();
    setRedirectCountdown(null);
    setShowRedirectModal(false);
  }

  async function handleCopyFallbackNumber() {
    try {
      await navigator.clipboard.writeText(fallbackNumber);
      setCopyFeedback("Number copied. Paste it into the official portal.");
    } catch {
      setCopyFeedback("Copy failed. Please select and copy the number manually.");
    }
  }

  async function handleOpenOfficialPortal() {
    cancelRedirect();

    try {
      await navigator.clipboard.writeText(fallbackNumber);
      setCopyFeedback(
        "Number copied. You can paste it into the official portal.",
      );
    } catch {
      setCopyFeedback("Copy failed. The official portal will still open in 5 seconds.");
    }

    setRedirectCountdown(5);
    setShowRedirectModal(true);

    countdownIntervalRef.current = window.setInterval(() => {
      setRedirectCountdown((current) => {
        if (current === null || current <= 1) {
          if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }

          return null;
        }

        return current - 1;
      });
    }, 1000);

    redirectTimeoutRef.current = window.setTimeout(() => {
      window.location.assign(OFFICIAL_REGISTRATION_PORTAL);
    }, 5000);
  }

  function handleRedirectNow() {
    cancelRedirect();
    window.location.assign(OFFICIAL_REGISTRATION_PORTAL);
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
          submit the fallback automatically from this app or paste into their form
          for you. We will copy the number for you, show a short notice, then open
          the portal so you only need to paste it there and click Verify.
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-muted px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          NAFDAC Number
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[0.08em]">{fallbackNumber}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={handleOpenOfficialPortal}>
          <ExternalLink className="size-4" />
          Open official portal
        </Button>
        <Button type="button" variant="secondary" onClick={handleCopyFallbackNumber}>
          <Copy className="size-4" />
          Copy number
        </Button>
      </div>

      {copyFeedback ? (
        <p className="mt-3 text-sm text-muted-foreground">{copyFeedback}</p>
      ) : null}

      {redirectCountdown !== null ? (
        <p className="mt-2 text-sm font-medium text-primary">
          Opening the official portal in {redirectCountdown}s...
        </p>
      ) : null}

      <Modal
        open={showRedirectModal}
        onClose={cancelRedirect}
        title="Number copied"
        description="Paste the copied NAFDAC number into the official portal when it opens."
        className="max-w-lg"
      >
        <div className="space-y-5 text-center">
          <div className="rounded-[24px] bg-muted px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Redirecting In
            </p>
            <p className="mt-2 text-5xl font-semibold text-primary">
              {redirectCountdown ?? 0}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The NAFDAC number has been copied. When the official site opens,
              tap the input field and paste the number.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={handleRedirectNow}>
              Go now
            </Button>
            <Button type="button" variant="secondary" onClick={cancelRedirect}>
              Stay here
            </Button>
          </div>
        </div>
      </Modal>
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

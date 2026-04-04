"use client";

import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, SearchX } from "lucide-react";
import { VerifyResultCard } from "@/components/features/verify/verify-result-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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

      <div className="mt-5 flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
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

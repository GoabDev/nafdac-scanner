import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OFFICIAL_REGISTRATION_PORTAL } from "@/lib/constants";
import { VerifyNafdacResponse } from "@/schemas/nafdac.schema";

type VerifyResultCardProps = {
  result: VerifyNafdacResponse;
  compact?: boolean;
};

export function VerifyResultCard({
  result,
  compact = false,
}: VerifyResultCardProps) {
  if (result.status !== "verified" || !result.product) {
    return null;
  }

  const product = result.product;

  return (
    <Card>
      <CardContent className="space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Product Details
            </p>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{product.name}</h2>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">Found in NAFDAC Greenbook</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <ResultItem label="NAFDAC No." value={product.nafdacNumber} />
          <ResultItem label="Category" value={product.category} />
          <ResultItem label="Status" value={product.status} />
          <ResultItem
            label="Applicant"
            value={product.applicant}
            className="col-span-2 lg:col-span-1"
          />
          <ResultItem label="Form" value={product.form} />
          <ResultItem label="Route" value={product.route} />
          <ResultItem label="Strength" value={product.strength} />
          <ResultItem label="Pack Size" value={product.packSize} />
          <ResultItem label="Approval Date" value={product.approvalDate} />
          <ResultItem label="Expiry Date" value={product.expiryDate} />
          <ResultItem
            label="Ingredient"
            value={product.ingredientName}
            className="col-span-2 lg:col-span-1"
          />
        </div>

        {product.composition ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Composition</p>
            <p className="text-sm leading-7 text-foreground">{product.composition}</p>
          </div>
        ) : null}

        {!compact && product.description ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="whitespace-pre-line text-sm leading-7 text-foreground">
              {product.description}
            </p>
          </div>
        ) : null}

        <a
          href={OFFICIAL_REGISTRATION_PORTAL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex"
        >
          <Button type="button" variant="secondary">
            <ExternalLink className="size-4" />
            Check on official portal
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function ResultItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={["rounded-2xl bg-muted px-3 py-3 sm:px-4", className].filter(Boolean).join(" ")}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 break-words">{value || "Not available"}</p>
    </div>
  );
}

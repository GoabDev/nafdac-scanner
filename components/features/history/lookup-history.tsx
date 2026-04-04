"use client";

import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LookupHistoryItem } from "@/schemas/history.schema";

type LookupHistoryProps = {
  items: LookupHistoryItem[];
  onSelect: (value: string) => void;
};

export function LookupHistory({ items, onSelect }: LookupHistoryProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-muted p-3 text-primary">
            <History className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Recent Searches
            </p>
            <h2 className="mt-1 text-xl font-semibold">Recently checked products</h2>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm leading-7 text-muted-foreground">
            Products you check will appear here on this device.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.nafdacNumber)}
                className="block w-full rounded-2xl border border-border bg-muted px-4 py-3 text-left hover:border-primary/35 hover:bg-primary/5"
              >
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.nafdacNumber}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

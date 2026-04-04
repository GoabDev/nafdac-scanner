import { SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type VerifyEmptyStateProps = {
  title: string;
  description: string;
};

export function VerifyEmptyState({
  title,
  description,
}: VerifyEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          <SearchX className="size-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

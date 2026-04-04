"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Search } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeNafdacNumber } from "@/lib/normalize-nafdac-number";

const VerifyFormSchema = z.object({
  number: z.string().trim().min(3, "Please enter a NAFDAC number."),
});

type VerifyFormValues = z.infer<typeof VerifyFormSchema>;

type VerifyFormProps = {
  initialValue: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isPending: boolean;
};

export function VerifyForm({
  initialValue,
  onValueChange,
  onSubmit,
  isPending,
}: VerifyFormProps) {
  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(VerifyFormSchema),
    defaultValues: {
      number: initialValue,
    },
  });

  useEffect(() => {
    form.setValue("number", initialValue);
  }, [form, initialValue]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        const normalized = normalizeNafdacNumber(values.number);
        onValueChange(normalized);
        onSubmit(normalized);
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="verify-number">
          Enter NAFDAC number
        </label>
        <Input
          id="verify-number"
          placeholder="For example: 04-0076"
          {...form.register("number", {
            onChange: (event) => onValueChange(event.target.value),
          })}
        />
        {form.formState.errors.number ? (
          <p className="text-sm text-danger">{form.formState.errors.number.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Checking product
          </>
        ) : (
          <>
            <Search className="size-4" />
            Check product
          </>
        )}
      </Button>
    </form>
  );
}

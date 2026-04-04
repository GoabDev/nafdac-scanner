"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { VerifyNafdacResponseSchema } from "@/schemas/nafdac.schema";

export function useVerifyNafdacMutation() {
  return useMutation({
    mutationFn: async (number: string) => {
      const response = await axios.post("/api/verify", { number });
      return VerifyNafdacResponseSchema.parse(response.data);
    },
  });
}

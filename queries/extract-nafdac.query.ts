"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ExtractNafdacResponseSchema } from "@/schemas/ocr.schema";

export function useExtractNafdacMutation() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/extract-number", formData);
      return ExtractNafdacResponseSchema.parse(response.data);
    },
  });
}

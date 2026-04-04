import { NextResponse } from "next/server";
import { verifyNafdacNumber } from "@/services/server/nafdac/verify.service";
import {
  VerifyNafdacRequestSchema,
  VerifyNafdacResponseSchema,
} from "@/schemas/nafdac.schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = VerifyNafdacRequestSchema.parse(json);
    const result = await verifyNafdacNumber(payload.number);

    return NextResponse.json(VerifyNafdacResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        {
          source: "greenbook",
          normalizedNumber: "",
          status: "invalid_input",
          product: null,
          message: "Enter a valid NAFDAC number before verifying.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        source: "greenbook",
        normalizedNumber: "",
        status: "unavailable",
        product: null,
        message:
          "Greenbook is temporarily unavailable. Try again shortly or cross-check on the official registration portal.",
      },
      { status: 503 },
    );
  }
}

import { normalizeNafdacNumber } from "@/lib/normalize-nafdac-number";
import {
  ProductResult,
  VerifyNafdacResponse,
} from "@/schemas/nafdac.schema";
import { searchGreenbookByNafdacNumber } from "@/services/server/nafdac/greenbook.service";

function mapProduct(
  product: Awaited<ReturnType<typeof searchGreenbookByNafdacNumber>>["data"][number],
): ProductResult {
  return {
    id: product.product_id,
    name: product.product_name,
    nafdacNumber: product.NAFDAC.trim(),
    category: product.product_category?.name ?? null,
    ingredientName: product.ingredient?.ingredient_name ?? null,
    form: product.form?.name ?? null,
    route: product.route?.name ?? null,
    strength: product.strength ?? null,
    applicant: product.applicant?.name ?? null,
    approvalDate: product.approval_date ?? null,
    expiryDate: product.expiry_date ?? null,
    packSize: product.pack_size ?? null,
    composition: product.composition ?? null,
    description: product.product_description ?? null,
    status: product.status ?? null,
  };
}

export async function verifyNafdacNumber(rawNumber: string): Promise<VerifyNafdacResponse> {
  const normalizedNumber = normalizeNafdacNumber(rawNumber);

  if (!normalizedNumber || !normalizedNumber.includes("-")) {
    return {
      source: "greenbook",
      normalizedNumber,
      status: "invalid_input",
      product: null,
      message: "Enter a valid NAFDAC number format, for example 04-0076.",
    };
  }

  const response = await searchGreenbookByNafdacNumber(normalizedNumber);

  if (response.recordsFiltered === 0 || response.data.length === 0) {
    return {
      source: "greenbook",
      normalizedNumber,
      status: "not_found",
      product: null,
      message:
        "No matching record was found in Greenbook. Cross-check the number or verify manually on the official registration portal.",
    };
  }

  return {
    source: "greenbook",
    normalizedNumber,
    status: "verified",
    product: mapProduct(response.data[0]),
    message: "Product found in the official Greenbook database.",
  };
}

export const dynamic = "force-dynamic";

import { handleFormSubmission } from "@/lib/submit-core";
import { BETA_TYPE } from "@/lib/beta";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return handleFormSubmission(request, { ...body, type: BETA_TYPE });
}

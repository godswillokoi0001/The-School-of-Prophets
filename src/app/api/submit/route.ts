export const dynamic = "force-dynamic";

import { handleFormSubmission } from "@/lib/submit-core";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return handleFormSubmission(request, body);
}

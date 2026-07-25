import { clearSession } from "@/lib/session";
import { apiHandler, ok } from "@/lib/api/responses";

export const POST = apiHandler(async () => {
  await clearSession();
  return ok({ success: true });
});

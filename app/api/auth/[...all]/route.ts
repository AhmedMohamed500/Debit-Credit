import { auth } from "@/lib/server/auth/auth";
import { endpoint, respond } from "@/lib/server/security/http";
import { backendConfigured, emailConfigured } from "@/lib/server/security/env";
import { z } from "zod";
import { body } from "@/lib/server/security/http";
export const runtime = "nodejs";
async function handle(request: Request) {
  if (!backendConfigured())
    return respond({ error: { code: "BACKEND_NOT_CONFIGURED" } }, 503);
  const path = new URL(request.url).pathname;
  if (
    /\/(request-password-reset|send-verification-email|reset-password)$/.test(
      path,
    ) &&
    !emailConfigured()
  )
    return respond({ error: { code: "EMAIL_UNAVAILABLE" } }, 503);
  try {
    if (request.method === "POST" && path.endsWith("/sign-up/email")) {
      const payload = await body(
        request,
        z
          .object({
            name: z.string().trim().min(2).max(60),
            email: z.string().email().max(254),
            password: z.string().min(12).max(128),
            callbackURL: z.string().max(600).optional(),
            image: z.string().url().max(500).optional(),
          })
          .strict(),
      );
      const headers = new Headers(request.headers);
      headers.delete("content-length");
      request = new Request(request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
    }
    return await auth().handler(request);
  } catch (error) {
    return endpoint(async () => {
      throw error;
    });
  }
}
export const GET = handle;
export const POST = handle;

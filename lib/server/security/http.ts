import "server-only";
import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import { db } from "../db/client";
import { configuration } from "./env";
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function body<T>(
  request: Request,
  schema: z.ZodType<T>,
  max = 262144,
): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new HttpError(415, "JSON_REQUIRED");
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "INVALID_JSON");
  const decoder = new TextDecoder();
  let text = "",
    bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > max) {
        void reader.cancel().catch(() => {});
        throw new HttpError(413, "PAYLOAD_TOO_LARGE");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new HttpError(400, "INVALID_JSON");
  }
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, "INVALID_INPUT");
  return result.data;
}
export function requireOrigin(request: Request) {
  if (request.headers.get("origin") !== configuration().baseURL)
    throw new HttpError(403, "ORIGIN_REJECTED");
}
export function respond(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function endpoint(work: () => Promise<unknown>) {
  try {
    return respond(await work());
  } catch (error) {
    if (error instanceof HttpError)
      return respond({ error: { code: error.code } }, error.status);
    // Never expose SQL, OAuth tokens, stack traces or credentials.
    return respond({ error: { code: "SERVICE_UNAVAILABLE" } }, 503);
  }
}
export async function limit(
  userId: string,
  scope: string,
  max = 30,
  windowMs = 60000,
) {
  const key = createHash("sha256").update(`${scope}:${userId}`).digest("hex");
  const now = BigInt(Date.now()),
    cutoff = now - BigInt(windowMs);
  const rows = await db().$queryRaw<{ count: number }[]>`
    INSERT INTO auth_rate_limit (id,key,count,"lastRequest") VALUES (${randomUUID()},${key},1,${now})
    ON CONFLICT (key) DO UPDATE SET count = CASE WHEN auth_rate_limit."lastRequest" < ${cutoff} THEN 1 ELSE auth_rate_limit.count + 1 END,
    "lastRequest" = CASE WHEN auth_rate_limit."lastRequest" < ${cutoff} THEN ${now} ELSE auth_rate_limit."lastRequest" END
    RETURNING count`;
  if (rows[0].count > max) throw new HttpError(429, "RATE_LIMITED");
}

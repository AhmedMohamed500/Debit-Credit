import { roleCatalog } from "@/lib/career/catalog";
import { requireUser } from "@/lib/server/auth/guards";
import { automaticCvFor } from "@/lib/server/profiles/cv";
import {
  exportAccountCv,
  validateCvExport,
  type CvExportFormat,
} from "@/lib/server/profiles/cv-export";
import { HttpError, limit, respond } from "@/lib/server/security/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request.headers);
    // Keep parity with other /me API routes: an old tab cannot silently
    // download a newly signed-in account's private CV.
    const context = request.headers.get("X-Account-Context");
    if (context && context !== user.id)
      throw new HttpError(409, "ACCOUNT_CHANGED");
    await limit(user.id, "cv-export", 30);
    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    const role = url.searchParams.get("role");
    if (format !== "pdf" && format !== "docx" && format !== "txt")
      throw new HttpError(400, "INVALID_FORMAT");
    if (role && !Object.hasOwn(roleCatalog, role))
      throw new HttpError(400, "INVALID_ROLE");
    const result = await automaticCvFor(user.id, role);
    if (!result) throw new HttpError(404, "CV_NOT_READY");
    const expectedVersion = request.headers.get("X-CV-Version");
    if (expectedVersion && expectedVersion !== result.data.fingerprint)
      throw new HttpError(409, "CV_CHANGED_REFRESH_PREVIEW");
    const validation = validateCvExport(result.data);
    if (validation) throw new HttpError(422, validation);
    const file = await exportAccountCv(result.data, format as CvExportFormat);
    return new Response(new Uint8Array(file.bytes), {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(file.bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof HttpError)
      return respond({ error: { code: error.code } }, error.status);
    return respond({ error: { code: "SERVICE_UNAVAILABLE" } }, 503);
  }
}

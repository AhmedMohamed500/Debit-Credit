import { z } from "zod";
import {
  endpoint,
  body,
  requireOrigin,
  limit,
  HttpError,
} from "@/lib/server/security/http";
import { requireUser, requireAdmin } from "@/lib/server/auth/guards";
import {
  ownProfile,
  saveProfile,
  saveCareerEntry,
} from "@/lib/server/profiles/service";
import {
  profileSchema,
  careerEntrySchema,
} from "@/lib/server/profiles/schemas";
import { progressFor, heartbeat } from "@/lib/server/progress/service";
import {
  foundationCommand,
  submitFoundation,
} from "@/lib/server/progress/foundations";
import {
  importSchema,
  importLegacy,
  backupSchema,
  saveBackup,
} from "@/lib/server/migration/service";
import {
  lobby,
  matchmake,
  matchFor,
  matchAction,
  submitMatch,
  leaderboard,
} from "@/lib/server/competition/service";
import {
  overview,
  users,
  usersQuery,
  competitionOverview,
} from "@/lib/server/admin/service";
import { emailConfigured, googleConfigured } from "@/lib/server/security/env";
import { bankSubmission, submitBank } from "@/lib/server/cases/bank";
import { personalFor, savePersonal } from "@/lib/server/profiles/personal";
import { personalCommand } from "@/lib/career/personal";
import { studentFor, submitStudent } from "@/lib/server/progress/student";
import { studentCommand } from "@/lib/student/unit";
import { automaticCvFor } from "@/lib/server/profiles/cv";
import { photoFor, savePhoto } from "@/lib/server/profiles/photo";
import { photoCommand } from "@/lib/career/photo";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return endpoint(async () => {
    const { path } = await params,
      key = path.join("/"),
      method = request.method;
    if (!["GET", "POST", "PUT"].includes(method))
      throw new HttpError(405, "METHOD_NOT_ALLOWED");
    if (method !== "GET") requireOrigin(request);
    const user = await requireUser(request.headers);
    // Context is a stale-tab guard, never an authentication or ownership source.
    const context = request.headers.get("X-Account-Context");
    if (context && context !== user.id)
      throw new HttpError(409, "ACCOUNT_CHANGED");
    if (method !== "GET")
      await limit(user.id, key, key === "me/progress" ? 120 : 30);
    switch (method + " " + key) {
      case "GET me":
        return {
          user: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            role: user.role,
          },
          profile: await ownProfile(user.id),
          capabilities: {
            google: googleConfigured(),
            email: emailConfigured(),
          },
          personalComplete: Boolean((await personalFor(user.id)).data),
        };
      case "GET me/personal":
        return personalFor(user.id);
      case "GET me/photo":
        return photoFor(user.id);
      case "PUT me/photo":
        return savePhoto(user.id, await body(request, photoCommand));
      case "GET me/cv":
        return automaticCvFor(user.id);
      case "PUT me/personal":
        return savePersonal(user.id, user.email, await body(request, personalCommand));
      case "GET me/student-unit":
        return studentFor(user.id);
      case "POST me/student-unit":
        return submitStudent(user.id, await body(request, studentCommand));
      case "GET me/profile":
        return ownProfile(user.id);
      case "PUT me/profile":
        return saveProfile(user.id, await body(request, profileSchema));
      case "GET me/progress":
        return progressFor(user.id);
      case "POST me/progress":
        return submitFoundation(
          user.id,
          await body(request, foundationCommand),
        );
      case "PUT me/progress":
        return saveBackup(user.id, await body(request, backupSchema));
      case "PUT me/career-entry":
        return saveCareerEntry(user.id, await body(request, careerEntrySchema));
      case "POST me/bank":
        return submitBank(user.id, await body(request, bankSubmission));
      case "POST me/activity":
        await body(request, z.object({}).strict());
        return heartbeat(user.id);
      case "POST migration/legacy":
        return importLegacy(user.id, await body(request, importSchema, 524288));
      case "GET competition/lobby":
        return lobby(user.id);
      case "POST competition/matchmake":
        await body(request, z.object({}).strict());
        return matchmake(user.id);
      case "GET competition/leaderboard": {
        const league = z
          .enum(["foundation", "practical", "general"])
          .safeParse(
            new URL(request.url).searchParams.get("league") ?? "foundation",
          );
        if (!league.success) throw new HttpError(400, "INVALID_LEAGUE");
        return leaderboard(league.data);
      }
      case "GET admin/overview":
        await requireAdmin(request.headers);
        return overview();
      case "GET admin/users": {
        await requireAdmin(request.headers);
        const result = usersQuery.safeParse(
          Object.fromEntries(new URL(request.url).searchParams),
        );
        if (!result.success) throw new HttpError(400, "INVALID_INPUT");
        return users(result.data);
      }
      case "GET admin/competition":
        await requireAdmin(request.headers);
        return competitionOverview();
    }
    if (
      path[0] === "competition" &&
      path[1] === "matches" &&
      z.string().uuid().safeParse(path[2]).success
    ) {
      if (method === "GET" && path.length === 3)
        return matchFor(user.id, path[2]);
      if (method === "POST" && path.length === 4 && path[3] === "submit")
        return submitMatch(user.id, path[2], await body(request, matchAction));
    }
    throw new HttpError(404, "NOT_FOUND");
  });
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;

import "server-only";
import { auth } from "./auth";
import { bootstrapUser, isOwnerEmail, resolveUser } from "../users/service";
import { HttpError } from "../security/http";
import { backendConfigured } from "../security/env";
export async function requireUser(headers: Headers) {
  if (!backendConfigured()) throw new HttpError(503, "BACKEND_NOT_CONFIGURED");
  const session = await auth().api.getSession({ headers });
  if (!session) throw new HttpError(401, "UNAUTHORIZED");
  const user = await resolveUser(session.user.id);
  if (!user) throw new HttpError(401, "UNAUTHORIZED");
  await bootstrapUser(user);
  return user;
}
export async function requireAdmin(headers: Headers) {
  const user = await requireUser(headers);
  if (user.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN");
  return user;
}
export async function requireOwner(headers: Headers) {
  const user = await requireAdmin(headers);
  if (!isOwnerEmail(user.email, user.emailVerified))
    throw new HttpError(403, "FORBIDDEN");
  return user;
}

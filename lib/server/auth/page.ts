import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser, requireAdmin } from "./guards";
import { backendConfigured } from "../security/env";
import { HttpError } from "../security/http";
export async function authorizePage(
  locale: string,
  path: string,
  admin = false,
) {
  if (!backendConfigured()) return false;
  try {
    await (admin ? requireAdmin : requireUser)(await headers());
    return true;
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect(
        `/${locale}/login?next=${encodeURIComponent("/" + locale + "/" + path)}`,
      );
    if (error instanceof HttpError && error.status === 403)
      redirect(`/${locale}/account?notice=admin-only`);
    return false;
  }
}

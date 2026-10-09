import "server-only";
export function configuration() {
  const databaseURL = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!databaseURL || !secret || secret.length < 32 || !baseURL)
    throw new Error("BACKEND_NOT_CONFIGURED");
  const origin = new URL(baseURL).origin;
  if (
    process.env.NODE_ENV === "production" &&
    !origin.startsWith("https://") &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin)
  )
    throw new Error("HTTPS_REQUIRED");
  return { databaseURL, secret, baseURL: origin };
}
export const backendConfigured = () =>
  Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_URL &&
    (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32,
  );
export const emailConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
// Optional OAuth setup must not block the database or email/password login.
export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

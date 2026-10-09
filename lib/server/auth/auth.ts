import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../db/client";
import {
  configuration,
  emailConfigured,
  googleConfigured,
} from "../security/env";
import { bootstrapUser } from "../users/service";
import { sendEmail } from "./email";
function createAuth() {
  const env = configuration(),
    email = emailConfigured();
  return betterAuth({
    database: prismaAdapter(db(), { provider: "postgresql" }),
    secret: env.secret,
    baseURL: env.baseURL,
    trustedOrigins: [env.baseURL],
    advanced: {
      database: { generateId: "uuid" },
      cookiePrefix: "app",
      useSecureCookies: env.baseURL.startsWith("https://"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
    },
    session: {
      cookieCache: { enabled: false },
      expiresIn: 604800,
      updateAge: 86400,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: false,
      ...(email
        ? {
            sendResetPassword: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => sendEmail(user.email, "Reset password", url),
          }
        : {}),
    },
    ...(email
      ? {
          emailVerification: {
            sendVerificationEmail: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => sendEmail(user.email, "Verify email", url),
          },
        }
      : {}),
    socialProviders: googleConfigured()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
          },
        }
      : {},
    account: { accountLinking: { enabled: false } },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "USER",
          input: false,
        },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 60, max: 3 },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await bootstrapUser(user);
          },
        },
      },
    },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export const auth = () => (instance ??= createAuth());

"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useCloudIdentity } from "./session-boundary";
import { safeNext } from "@/lib/auth/safe-next";
export function AuthCTA({ href, ...props }: ComponentProps<typeof Link>) {
  const identity = useCloudIdentity(),
    path = typeof href === "string" ? href : "/ar/onboarding",
    locale = path.startsWith("/en") ? "en" : "ar",
    next = safeNext(path, locale);
  return (
    <Link
      {...props}
      href={
        identity
          ? next
          : `/${locale}/signup?next=${encodeURIComponent(`/${locale}`)}`
      }
    />
  );
}

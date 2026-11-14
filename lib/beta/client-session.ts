"use client";

import { requestJSON } from "@/lib/cloud/runtime";

const ACTIVE_BETA_SESSION = "debit-credit-beta-active-session-v1";

export function recordBetaSession(userId: string) {
  if (window.sessionStorage.getItem(ACTIVE_BETA_SESSION) === userId) return;
  window.sessionStorage.setItem(ACTIVE_BETA_SESSION, userId);
  void requestJSON("me/beta-event", "POST", {
    event: "session_seen",
  }).catch(() => {
    if (window.sessionStorage.getItem(ACTIVE_BETA_SESSION) === userId)
      window.sessionStorage.removeItem(ACTIVE_BETA_SESSION);
  });
}

export function clearBetaSession(userId: string) {
  if (window.sessionStorage.getItem(ACTIVE_BETA_SESSION) === userId)
    window.sessionStorage.removeItem(ACTIVE_BETA_SESSION);
}

"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CloudCacheRepository, type LegacySnapshot } from "@/lib/cloud/cache";
import {
  requestJSON,
  configureCloud,
  CloudFailure,
  currentSyncStatus,
  retryBackups,
  pendingBackups,
  type CloudIdentity,
  type CloudProgress,
} from "@/lib/cloud/runtime";
import { authClient } from "@/lib/auth/client";
import type { Locale } from "@/types";
const Context = createContext<CloudIdentity | null>(null);
export const useCloudIdentity = () => useContext(Context);
export function CloudSessionBoundary({
  children,
  locale,
  enabled,
}: {
  children: React.ReactNode;
  locale: Locale;
  enabled: boolean;
}) {
  const pathname = usePathname(),
    publicProfile = /^\/(ar|en)\/portfolio\//.test(pathname),
    accountHome = pathname === `/${locale}`,
    privatePath =
      /^\/(ar|en)\/(student|onboarding|bootcamp|game|career-profile|career-league|career|profile|leaderboard|competition|account)(\/|$)/.test(
        pathname,
      );
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en);
  const [identity, setIdentity] = useState<CloudIdentity | null>(null),
    [ready, setReady] = useState(false),
    [loadedPath, setLoadedPath] = useState(""),
    [error, setError] = useState(""),
    [legacy, setLegacy] = useState<LegacySnapshot | null>(null),
    [status, setStatus] = useState("ready"),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (publicProfile) {
      setIdentity(null);
      setLoadedPath(pathname);
      setReady(true);
      return;
    }
    if (!enabled) {
      try {
        new CloudCacheRepository().restoreGuest();
      } catch {}
      configureCloud(null);
      setLoadedPath(pathname);
      setReady(true);
      return;
    }
    setError("");
    setReady(false);
    try {
      const me = await requestJSON<CloudIdentity>("me");
      setIdentity(me);
      if (privatePath && me.personalComplete === false) {
        window.location.replace(`/${locale}/student-profile?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const cache = new CloudCacheRepository();
      if (!privatePath && !accountHome) {
        setLoadedPath(pathname);
        setReady(true);
        return;
      }
      if (!cache.owner() && cache.meaningful()) {
        cache.preserveGuest();
        setLegacy(cache.legacy());
        return;
      }
      const progress = await requestJSON<CloudProgress>("me/progress");
      cache.hydrate(me, progress);
      configureCloud(me.user.id, progress);
      setLegacy(null);
      setLoadedPath(pathname);
      setReady(true);
    } catch (e) {
      if (e instanceof CloudFailure && e.status === 401) {
        new CloudCacheRepository().restoreGuest();
        configureCloud(null);
        setIdentity(null);
        setLoadedPath(pathname);
        setReady(true);
      } else {
        setError(
          ar
            ? "السحابة غير متاحة. لم يتم استبدال بيانات جهازك المحفوظة."
            : "Cloud unavailable. Your saved device data has not been replaced.",
        );
      }
    }
  }, [enabled, privatePath, publicProfile, accountHome, ar, locale, pathname]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const handler = () => setStatus(currentSyncStatus());
    window.addEventListener("app-sync-status", handler);
    return () => window.removeEventListener("app-sync-status", handler);
  }, []);
  useEffect(() => {
    if (publicProfile || !identity || !ready || loadedPath !== pathname) return;
    const beat = () => {
      if (!document.hidden)
        void requestJSON("me/activity", "POST", {}).catch(() => {});
    };
    beat();
    const interval = setInterval(beat, 60000);
    return () => clearInterval(interval);
  }, [identity, ready, loadedPath, pathname, publicProfile]);
  async function migrate(mode: "merge" | "cloud") {
    if (!legacy || !identity || busy) return;
    setBusy(true);
    setError("");
    try {
      await requestJSON("migration/legacy", "POST", {
        version: 1,
        deviceId: new CloudCacheRepository().device(),
        mode,
        domains: legacy,
      });
      const progress = await requestJSON<CloudProgress>("me/progress");
      new CloudCacheRepository().hydrate(identity, progress);
      configureCloud(identity.user.id, progress);
      setLegacy(null);
      setLoadedPath(pathname);
      setReady(true);
    } catch {
      setError(
        say(
          "Import not confirmed. Your original device data is preserved. Retry.",
          "لم يتم تأكيد الاستيراد. بيانات الجهاز الأصلية محفوظة. حاول ثانية.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  const bar = !publicProfile && identity && (
    <div className="cloud-account-bar">
      <span>{identity.profile.displayName}</span>
      <Link href={`/${locale}/account`}>{say("My account", "حسابي")}</Link>
      <Link href={`/${locale}/competition`}>
        {say("Online competition", "المنافسة السحابية")}
      </Link>
      {identity.user.role === "ADMIN" && (
        <Link href={`/${locale}/admin`}>{say("Admin", "الإدارة")}</Link>
      )}
      <span role="status">
        {status === "saved"
          ? say("Server confirmed", "تم تأكيد الحفظ")
          : status === "saving"
            ? say("Sync pending…", "جارٍ الحفظ…")
            : status === "conflict"
              ? say(
                  "Conflict — cloud was not overwritten",
                  "تعارض — لم تُستبدل السحابة",
                )
              : status === "unsynced"
                ? say("Not synced yet", "لم يتم الحفظ سحابيًا")
                : ""}
      </span>
      {status === "unsynced" && (
        <button onClick={retryBackups}>{say("Retry", "حاول ثانية")}</button>
      )}
      <button
        onClick={async () => {
          if (
            pendingBackups() &&
            !window.confirm(
              say(
                "Some local backups are not synced. Sign out anyway?",
                "بعض النسخ المحلية لم تُحفظ سحابيًا. هل تريد الخروج؟",
              ),
            )
          )
            return;
          const result = await authClient.signOut();
          if (result.error) {
            setError(
              say("Sign out failed. Retry.", "تعذّر الخروج. حاول ثانية."),
            );
            return;
          }
          configureCloud(null);
          new CloudCacheRepository().restoreGuest();
          window.location.assign(
            new URL(`/${locale}`, window.location.origin).href,
          );
        }}
      >
        {say("Sign out", "خروج")}
      </button>
    </div>
  );
  if ((privatePath || (accountHome && identity)) && (!ready || loadedPath !== pathname))
    return (
      <Context.Provider value={identity}>
        {bar}
        <main className="cloud-page">
          <section className="cloud-card cloud-state">
            {legacy ? (
              <>
                <h1>
                  {say(
                    "We found progress saved on this device",
                    "وجدنا تقدمًا محفوظًا على هذا الجهاز",
                  )}
                </h1>
                <p>
                  {say(
                    "Nothing is imported automatically. Imported progress never becomes Verified or official competition points.",
                    "لن نُجري استيرادًا تلقائيًا. التقدم المستورد لا يصبح Verified أو نقاط منافسة رسمية.",
                  )}
                </p>
                <details>
                  <summary>{say("Review summary", "مراجعة الملخص")}</summary>
                  <ul>
                    {Object.keys(legacy).map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </details>
                <div className="cloud-migration-actions">
                  <button disabled={busy} onClick={() => void migrate("merge")}>
                    {say("Merge with my account", "دمج مع حسابي")}
                  </button>
                  <button disabled={busy} onClick={() => void migrate("cloud")}>
                    {say("Keep cloud account", "الاحتفاظ بالحساب السحابي")}
                  </button>
                </div>
              </>
            ) : (
              <h1>
                {error
                  ? say("Connection unavailable", "الاتصال غير متاح")
                  : say("Restoring your account…", "جارٍ استعادة حسابك…")}
              </h1>
            )}
            {error && (
              <>
                <p role="alert">{error}</p>
                <button onClick={() => void load()}>
                  {say("Retry", "حاول ثانية")}
                </button>
              </>
            )}
          </section>
        </main>
      </Context.Provider>
    );
  return (
    <Context.Provider value={publicProfile ? null : identity}>
      {bar}
      {children}
    </Context.Provider>
  );
}

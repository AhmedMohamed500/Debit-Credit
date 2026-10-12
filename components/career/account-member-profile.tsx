"use client";
import { useEffect, useState } from "react";
import { cloudUser, requestJSON } from "@/lib/cloud/runtime";
import type {
  CareerProfile,
  SkillEvidence,
  SkillResult,
} from "@/lib/career/model";
import type { Locale } from "@/types";
import { MemberProfile } from "./member-profile";

// Owner-only view reads the same canonical projection as the CV. A cached guest
// profile is not a source for an authenticated person's name or personal fields.
export function AccountMemberProfile({
  owner,
  locale,
  evidence,
  passport,
}: {
  owner: string;
  locale: Locale;
  evidence: SkillEvidence[];
  passport: SkillResult[];
}) {
  const [saved, setSaved] = useState<{
    owner: string;
    profile: CareerProfile;
  } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let alive = true;
    setFailure(null);
    void requestJSON<{
      data: { profile: CareerProfile; cv: { summary: string } };
    } | null>("me/cv")
      .then((result) => {
        const profile = result?.data?.profile;
        if (!profile?.fullName?.trim()) throw new Error("PROFILE_UNAVAILABLE");
        if (alive && cloudUser() === owner)
          setSaved({
            owner,
            profile: {
              ...profile,
              summary: profile.summary || result?.data.cv.summary || "",
            },
          });
      })
      .catch(() => {
        if (alive && cloudUser() === owner) setFailure(owner);
      });
    return () => {
      alive = false;
    };
  }, [owner, refresh]);
  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1);
    const synced = (event: Event) => {
      if ((event as CustomEvent).detail === "saved") reload();
    };
    window.addEventListener("focus", reload);
    window.addEventListener("app-sync-status", synced);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("app-sync-status", synced);
    };
  }, []);
  if (saved?.owner === owner)
    return (
      <MemberProfile
        locale={locale}
        profile={saved.profile}
        evidence={evidence}
        passport={passport}
      />
    );
  return (
    <main className="career-loading" dir={locale === "ar" ? "rtl" : "ltr"}>
      {failure === owner ? (
        <div role="alert">
          <p>
            {locale === "ar"
              ? "تعذر تحميل بيانات بروفايلك المحفوظة. لم نعرض بيانات افتراضية بدلًا منها."
              : "Could not load your saved profile. We have not substituted a default profile."}
          </p>
          <button onClick={() => setRefresh((value) => value + 1)}>
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      ) : (
        <p role="status">
          {locale === "ar"
            ? "جارٍ تحميل بيانات بروفايلك المحفوظة…"
            : "Loading your saved career profile…"}
        </p>
      )}
    </main>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { cloudUser, requestJSON } from "@/lib/cloud/runtime";
import type {
  CareerProfile,
  CvPreferences,
  SkillEvidence,
  SkillResult,
} from "@/lib/career/model";
import type { Locale } from "@/types";
import { MemberProfile } from "./member-profile";

// Owner-only view reads the same canonical projection as the CV. A cached guest
// profile is not a source for an authenticated person's name or personal fields.
export type AccountCareerProjection = {
  profile: CareerProfile;
  cv: { summary: string; targetRoleId?: CvPreferences["targetRoleId"] };
  evidence: SkillEvidence[];
  passport: SkillResult[];
};

export function AccountCareerData({
  owner,
  locale,
  children,
}: {
  owner: string;
  locale: Locale;
  children: (data: AccountCareerProjection) => ReactNode;
}) {
  const [saved, setSaved] = useState<{
    owner: string;
    data: AccountCareerProjection;
  } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let alive = true;
    setFailure(null);
    void requestJSON<{ data: AccountCareerProjection } | null>("me/cv")
      .then((result) => {
        const data = result?.data;
        if (
          !data?.profile ||
          !Array.isArray(data.evidence) ||
          !Array.isArray(data.passport)
        )
          throw new Error("PROFILE_UNAVAILABLE");
        if (alive && cloudUser() === owner)
          setSaved({
            owner,
            data: {
              ...data,
              profile: {
                ...data.profile,
                summary: data.profile.summary || data.cv.summary || "",
              },
            },
          });
      })
      .catch(() => {
        if (alive && cloudUser() === owner) {
          setSaved(null);
          setFailure(owner);
        }
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
  if (saved?.owner === owner) return <>{children(saved.data)}</>;
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

export function AccountMemberProfile({
  owner,
  locale,
}: {
  owner: string;
  locale: Locale;
}) {
  return (
    <AccountCareerData owner={owner} locale={locale}>
      {({ profile, evidence, passport }) =>
        profile.fullName.trim() ? (
          <MemberProfile
            locale={locale}
            profile={profile}
            evidence={evidence}
            passport={passport}
          />
        ) : (
          <main className="career-loading" dir={locale === "ar" ? "rtl" : "ltr"}>
            <div role="status">
              <p>{locale === "ar" ? "اسمك الكامل لم يُضف إلى بيانات حسابك بعد. أكمل بياناتك المحفوظة لتظهر في الملف المهني والـCV." : "Your full name has not been added to your account yet. Complete your saved details before your career profile and CV can show it."}</p>
              <Link href={`/${locale}/student-profile?next=${encodeURIComponent(`/${locale}/career-profile`)}`}>{locale === "ar" ? "أكمل بيانات الحساب" : "Complete account details"}</Link>
            </div>
          </main>
        )
      }
    </AccountCareerData>
  );
}

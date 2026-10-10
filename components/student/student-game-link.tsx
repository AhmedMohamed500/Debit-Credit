"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { requestJSON } from "@/lib/cloud/runtime";
import type { StudentState } from "@/lib/student/unit";
import type { Locale } from "@/types";
import "@/app/student-game.css";
export function StudentGameLink({ locale }: { locale: Locale }) {
  const identity = useCloudIdentity(),
    owner = identity?.user.id,
    [count, setCount] = useState<number | null>(null),
    ar = locale === "ar",
    Arrow = ar ? ArrowLeft : ArrowRight;
  useEffect(() => {
    let alive = true;
    setCount(null);
    if (owner)
      void requestJSON<{ data: StudentState }>("me/student-unit")
        .then((row) => {
          if (alive) setCount(row.data.accepted.length);
        })
        .catch(() => {});
    return () => {
      alive = false;
    };
  }, [owner]);
  return (
    <section
      className="student-game-link"
      aria-label={
        ar ? "تدريب الطالب داخل اللعبة" : "Student training in the game"
      }
    >
      <FileCheck2 size={36} />
      <div>
        <small>MIZAN OS · {ar ? "الوحدة الأولى" : "UNIT ONE"}</small>
        <h2>{ar ? "من المستند إلى الدفاتر" : "Source documents to books"}</h2>
        <p>
          {ar
            ? "افتح مكتب التدريب في مدينة اللعب. راجع المستندات، سجّل القيود، واكتشف أثرها على الدفاتر. إنجازاتك المقبولة تبني سيرتك الإنجليزية تلقائيًا."
            : "Open your training desk in the game city. Inspect documents, post entries and follow their impact through the books. Accepted work builds your English CV automatically."}
        </p>
        <small>
          {count === null
            ? ar
              ? "التقدم محفوظ بحسابك"
              : "Progress saved to your account"
            : `${count}/11 ${ar ? "تاسك مقبول" : "accepted tasks"}`}
        </small>
      </div>
      <Link href={`/${locale}/game/student`}>
        {count
          ? ar
            ? "كمّل ملف التدريب"
            : "Resume training"
          : ar
            ? "افتح مكتب التدريب"
            : "Open training desk"}
        <Arrow />
      </Link>
    </section>
  );
}

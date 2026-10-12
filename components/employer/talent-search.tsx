"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Search,
  Shield,
  X,
  GraduationCap,
  Award,
  Calendar,
  Clock,
  Languages,
  ChartNoAxesCombined,
  MoreHorizontal,
} from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { ThemeToggle } from "@/components/platform/theme-provider";
import { requestJSON, cloudUser } from "@/lib/cloud/runtime";
import {
  roleCatalog,
  roleIds,
  skillCatalog,
  skillIds,
} from "@/lib/career/catalog";
import {
  requirementOverlap,
  type Candidate,
  type Company,
  type SearchResults,
} from "@/lib/talent/model";
import type { CvBlock } from "@/lib/career/compact-cv";
import type { Locale } from "@/types";
import { WorkPreview } from "@/components/career/showcase";
import { SharedCvView } from "@/components/career/shared-cv-view";
import "@/app/talent-platform.css";
import "@/app/employer-talent.css";
import "@/app/reference-implementation.css";

type Filters = {
  q: string;
  role: string;
  skill: string;
  location: string;
  education: string;
  availability: string;
  level: string;
};
const emptyFilters: Filters = {
  q: "",
  role: "",
  skill: "",
  location: "",
  education: "",
  availability: "",
  level: "",
};
export function TalentSearch({
  locale,
  mode = "search",
  candidateId,
}: {
  locale: Locale;
  mode?: "search" | "shortlist" | "company" | "candidate";
  candidateId?: string;
}) {
  const identity = useCloudIdentity(),
    owner = identity?.user.id,
    ar = locale === "ar",
    say = (en: string, arabic: string) => (ar ? arabic : en);
  const selectionVersion = useRef(0);
  const [account, setAccount] = useState<{
      owner: string;
      company: Company | null;
    } | null>(null),
    [results, setResults] = useState<{
      owner: string;
      data: SearchResults;
    } | null>(null),
    [selected, setSelected] = useState<{
      owner: string;
      candidate: Candidate;
    } | null>(null);
  const [draft, setDraft] = useState({ ...emptyFilters }),
    [filters, setFilters] = useState({ ...emptyFilters }),
    [page, setPage] = useState(1),
    [refresh, setRefresh] = useState(0);
  const [saved, setSaved] = useState<{ owner: string; ids: string[] } | null>(
      null,
    ),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const company = account && account.owner === owner ? account.company : null,
    list = results && results.owner === owner ? results.data : null,
    candidate =
      selected && selected.owner === owner ? selected.candidate : null,
    shortlist = saved && saved.owner === owner ? saved.ids : [];
  useEffect(() => {
    let alive = true;
    setAccount(null);
    setResults(null);
    setSelected(null);
    selectionVersion.current++;
    setSaved(null);
    setError("");
    if (owner)
      void requestJSON<{ company: Company | null }>("employer/account")
        .then((data) => {
          if (alive && cloudUser() === owner)
            setAccount({ owner, company: data.company });
        })
        .catch(() => {
          if (alive)
            setError(
              say(
                "Could not load employer permissions. Retry.",
                "تعذر تحميل صلاحيات الشركة. حاول ثانية.",
              ),
            );
        });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, refresh]);
  useEffect(() => {
    if (!owner || !company) return;
    let alive = true;
    setLoading(true);
    selectionVersion.current++;
    setBusy(false);
    setResults(null);
    setSelected(null);
    setError("");
    const params = new URLSearchParams({ page: String(page) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const route =
      mode === "shortlist"
        ? "employer/shortlist"
        : "employer/candidates?" + params;
    void requestJSON<SearchResults>(route)
      .then((data) => {
        if (alive && cloudUser() === owner)
          setResults({
            owner,
            data: {
              ...data,
              page: data.page ?? 1,
              pageSize: data.pageSize ?? 100,
            },
          });
      })
      .catch(() => {
        if (alive)
          setError(
            say(
              "Search unavailable; no results have been invented.",
              "البحث غير متاح؛ لم يتم اختلاق نتائج.",
            ),
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    void requestJSON<{ items: Candidate[] }>("employer/shortlist")
      .then((data) => {
        if (alive && cloudUser() === owner)
          setSaved({ owner, ids: data.items.map((row) => row.id) });
      })
      .catch(() => {});
    if (candidateId)
      void requestJSON<Candidate>("employer/candidates/" + candidateId)
        .then((value) => {
          if (alive && cloudUser() === owner)
            setSelected({ owner, candidate: value });
        })
        .catch(() => {
          if (alive)
            setError(
              say(
                "Candidate unavailable or discovery was revoked.",
                "المرشح غير متاح أو أوقف الاكتشاف.",
              ),
            );
        });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, company?.id, filters, page, mode, candidateId]);
  async function open(id: string) {
    if (!owner) return;
    const version = ++selectionVersion.current;
    setSelected(null);
    setBusy(true);
    setError("");
    try {
      const value = await requestJSON<Candidate>("employer/candidates/" + id);
      if (cloudUser() === owner && selectionVersion.current === version)
        setSelected({ owner, candidate: value });
    } catch {
      if (cloudUser() === owner && selectionVersion.current === version)
        setError(
          say("Candidate is no longer available.", "المرشح لم يعد متاحًا."),
        );
    } finally {
      if (selectionVersion.current === version) setBusy(false);
    }
  }
  async function toggle(value: Candidate) {
    if (!owner || busy) return;
    const action = shortlist.includes(value.id) ? "remove" : "add";
    setBusy(true);
    setError("");
    try {
      await requestJSON("employer/shortlist", "PUT", {
        candidate: value.id,
        action,
      });
      if (cloudUser() !== owner) return;
      setSaved({
        owner,
        ids:
          action === "add"
            ? [...shortlist, value.id]
            : shortlist.filter((id) => id !== value.id),
      });
      if (mode === "shortlist" && list && action === "remove") {
        setResults({
          owner,
          data: {
            ...list,
            items: list.items.filter((row) => row.id !== value.id),
            total: list.total - 1,
          },
        });
        setSelected(null);
      }
    } catch {
      if (cloudUser() === owner)
        setError(
          say(
            "Shortlist not saved. The candidate may have revoked consent or the 100-candidate limit was reached.",
            "لم تُحفظ القائمة؛ ربما أوقف المرشح الاكتشاف أو وصلت لحد 100 مرشح.",
          ),
        );
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ ...draft });
    setPage(1);
  }
  return (
    <main className="talent-platform" dir={ar ? "rtl" : "ltr"}>
      <header className="talent-nav">
        <Link className="talent-brand" href={`/${locale}/companies`}>
          <ChartNoAxesCombined size={24} />
          Debit & Credit
        </Link>
        <nav>
          <Link
            href={`/${locale}/employer/candidates`}
            aria-current={mode === "search" ? "page" : undefined}
          >
            {say("Candidates", "المرشحون")}
          </Link>
          <button disabled className="nav-disabled">
            {say("Jobs", "الوظائف")}
          </button>
          <button disabled className="nav-disabled">
            {say("Analytics", "التحليلات")}
          </button>
          <Link
            href={`/${locale}/employer/company`}
            aria-current={mode === "company" ? "page" : undefined}
          >
            {say("Company profile", "ملف الشركة")}
          </Link>
        </nav>
        <ThemeToggle compact />
        {company && (
          <span className="company-name">
            {company.name}
            <small>{say("Self-reported employer", "شركة معلنة ذاتيًا")}</small>
          </span>
        )}
        <details className="portfolio-menu">
          <summary aria-label={say("Employer actions", "إجراءات الشركة")}>
            <MoreHorizontal size={19} />
          </summary>
          <div>
            <Link href={`/${locale}/employer/shortlist`}>
              {say("Shortlist", "القائمة المختصرة")}
            </Link>
            <Link href={`/${locale}/career-profile`}>
              {say("My portfolio", "ملفي المهني")}
            </Link>
          </div>
        </details>
      </header>
      {!owner ? (
        <section className="talent-empty">
          <Shield size={32} />
          <h1>{say("Employer access", "دخول أصحاب العمل")}</h1>
          <p>
            {say(
              "Sign in to create your employer profile and review opted-in candidates.",
              "سجل الدخول لإنشاء ملف شركتك ومراجعة المرشحين الموافقين على الظهور.",
            )}
          </p>
          <Link
            className="talent-primary"
            href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/employer/candidates`)}`}
          >
            {say("Sign in", "تسجيل الدخول")}
          </Link>
        </section>
      ) : !account ? (
        <section className="talent-empty" role="status">
          {error || say("Loading permissions…", "تحميل الصلاحيات…")}
          <button onClick={() => setRefresh((value) => value + 1)}>
            {say("Retry", "حاول ثانية")}
          </button>
        </section>
      ) : !company || mode === "company" ? (
        <CompanyEditor
          company={company}
          owner={owner}
          locale={locale}
          done={(value) => setAccount({ owner, company: value })}
        />
      ) : (
        <>
          <section className="talent-hero">
            <h1>
              {mode === "shortlist"
                ? say("Your candidate shortlist", "قائمتك المختصرة للمرشحين")
                : say("Find the Right Talent", "اعثر على المواهب المناسبة")}
            </h1>
            {mode !== "shortlist" && (
              <h1>{say("in Accounting & Finance", "في المحاسبة والمالية")}</h1>
            )}
            <p>
              {say(
                "Discover candidates through real accounting practice and shared professional profiles.",
                "اكتشف المرشحين من خلال الممارسة المحاسبية الفعلية والملفات المهنية المشتركة.",
              )}
            </p>
            {mode !== "shortlist" && (
              <form onSubmit={submit} className="talent-search-form">
                <div className="talent-search-line">
                  <label>
                    <Search size={17} />
                    <input
                      name="q"
                      value={draft.q}
                      maxLength={100}
                      onChange={(e) =>
                        setDraft((value) => ({ ...value, q: e.target.value }))
                      }
                      placeholder={say(
                        "Search name, skills or education…",
                        "ابحث بالاسم أو المهارات أو التعليم…",
                      )}
                      aria-label={say("Search candidates", "البحث عن مرشحين")}
                    />
                  </label>
                  <label className="search-location">
                    <MapPin size={16} />
                    <select
                      name="search-location"
                      aria-label={say("Search location", "مكان البحث")}
                      value={draft.location}
                      onChange={(e) =>
                        setDraft((value) => ({
                          ...value,
                          location: e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {say("All locations", "كل الأماكن")}
                      </option>
                      {[
                        ...new Set(
                          [
                            draft.location,
                            ...(list?.items.map((row) => row.location) ?? []),
                          ].filter(Boolean),
                        ),
                      ].map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="talent-primary" type="submit">
                    {say("Search", "ابحث")}
                  </button>
                </div>
                <div className="talent-filters">
                  {[
                    [
                      "role",
                      say("Role", "الدور"),
                      roleIds.map((id) => [id, roleCatalog[id].label[locale]]),
                    ],
                    [
                      "skill",
                      say("Skill", "المهارة"),
                      skillIds.map((id) => [
                        id,
                        skillCatalog[id].label[locale],
                      ]),
                    ],
                    [
                      "availability",
                      say("Availability", "التوفر"),
                      [
                        ["internship", say("Internship", "تدريب")],
                        ["work", say("Open to work", "متاح للعمل")],
                        ["not-looking", say("Not looking", "غير باحث")],
                      ],
                    ],
                    [
                      "level",
                      say("More filters", "مزيد من الفلاتر"),
                      [
                        ["student", say("Student", "طالب")],
                        ["fresh-graduate", say("Graduate", "خريج")],
                        ["junior", say("Junior", "مبتدئ")],
                        ["mid", say("Mid-level", "متوسط")],
                        ["senior", say("Senior", "خبير")],
                      ],
                    ],
                  ].map(([key, label, options]) => (
                    <label key={String(key)}>
                      {String(label)}
                      <select
                        name={String(key)}
                        value={draft[key as keyof Filters]}
                        onChange={(e) =>
                          setDraft((value) => ({
                            ...value,
                            [String(key)]: e.target.value,
                          }))
                        }
                      >
                        <option value="">{say("All", "الكل")}</option>
                        {(options as string[][]).map(([id, text]) => (
                          <option key={id} value={id}>
                            {text}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label>
                    {say("Location", "المكان")}
                    <input
                      name="location"
                      value={draft.location}
                      maxLength={100}
                      onChange={(e) =>
                        setDraft((value) => ({
                          ...value,
                          location: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    {say("Education", "التعليم")}
                    <input
                      name="education"
                      value={draft.education}
                      maxLength={100}
                      onChange={(e) =>
                        setDraft((value) => ({
                          ...value,
                          education: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </form>
            )}
          </section>
          <div role="status" className="talent-status">
            {error}
            {loading && say("Searching…", "جارٍ البحث…")}
          </div>
          <div
            className={`talent-split ${candidate ? "has-selection" : ""} ${mode === "candidate" ? "full-profile" : ""}`}
          >
            {mode !== "candidate" && (
              <section className="talent-list">
                <header>
                  <h2>
                    {say("Candidates", "المرشحون")} ({list?.total ?? "—"})
                  </h2>
                  <small>
                    {say(
                      "Recently updated · no invented match score",
                      "الأحدث تحديثًا · بدون تقييم ملاءمة مختلق",
                    )}
                  </small>
                </header>
                {list?.items.map((value) => {
                  const overlap = requirementOverlap(
                    value,
                    filters.skill ? [filters.skill] : [],
                  );
                  return (
                    <article
                      className={`talent-result ${candidate?.id === value.id ? "selected" : ""}`}
                      key={value.id}
                    >
                      <button
                        className="candidate-result-open"
                        onClick={() => void open(value.id)}
                        disabled={busy}
                      >
                        <CandidatePortrait candidate={value} />
                        <div>
                          <h3>{value.name}</h3>
                          <p>
                            {value.currentRole ||
                              roleCatalog[value.role].label[locale]}
                          </p>
                          {value.location && (
                            <small>
                              <MapPin size={12} />
                              {value.location}
                            </small>
                          )}
                          <div className="talent-chips">
                            {value.skills.slice(0, 3).map((skill) => (
                              <span key={skill.skillId}>
                                {skillCatalog[skill.skillId].label[locale]}
                              </span>
                            ))}
                          </div>
                          <span className="talent-match">
                            {overlap.requested > 0
                              ? `${overlap.matched}/${overlap.requested}`
                              : value.skills.length}{" "}
                            {say("skills", "مهارات")}
                          </span>
                        </div>
                      </button>
                      <button
                        className="talent-bookmark"
                        disabled={busy}
                        aria-label={`${shortlist.includes(value.id) ? say("Remove", "إزالة") : say("Shortlist", "حفظ")} ${value.name}`}
                        aria-pressed={shortlist.includes(value.id)}
                        onClick={() => void toggle(value)}
                      >
                        {shortlist.includes(value.id) && <Bookmark size={12} />}
                      </button>
                    </article>
                  );
                })}
                {list && list.items.length === 0 && (
                  <div className="talent-empty">
                    <Search size={32} />
                    <h3>
                      {say("No matching candidates", "لا توجد نتائج مطابقة")}
                    </h3>
                    <p>
                      {say(
                        "Try different filters. Private users are never shown and no demo accounts are seeded.",
                        "جرّب معايير أخرى. الحسابات الخاصة لا تظهر ولا تُضاف حسابات تجريبية.",
                      )}
                    </p>
                  </div>
                )}
                {mode === "search" && list && list.total > 20 && (
                  <div className="talent-pagination">
                    <button
                      disabled={page === 1 || loading}
                      onClick={() => setPage((value) => value - 1)}
                    >
                      <ChevronLeft />
                      {say("Previous", "السابق")}
                    </button>
                    <span>
                      {page} / {Math.ceil(list.total / 20)}
                    </span>
                    <button
                      disabled={page * 20 >= list.total || loading}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      {say("Next", "التالي")}
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </section>
            )}
            {candidate ? (
              <CandidatePreview
                key={candidate.id}
                candidate={candidate}
                owner={owner}
                locale={locale}
                busy={busy}
                saved={shortlist.includes(candidate.id)}
                toggle={() => void toggle(candidate)}
                close={() => setSelected(null)}
              />
            ) : (
              mode !== "candidate" && (
                <section className="talent-preview-placeholder">
                  <Shield size={38} />
                  <h2>{say("Select a candidate", "اختر مرشحًا")}</h2>
                  <p>
                    {say(
                      "Review only the professional fields they agreed to share. Account email, phone and private certificate images are never disclosed.",
                      "راجع البيانات المهنية التي وافق على مشاركتها فقط. لا نكشف بريد الحساب أو الهاتف أو صور الشهادات الخاصة.",
                    )}
                  </p>
                </section>
              )
            )}
          </div>
        </>
      )}
    </main>
  );
}
function CandidatePortrait({ candidate }: { candidate: Candidate }) {
  return candidate.photo ? (
    <Image
      className="talent-portrait"
      src={candidate.photo}
      alt={candidate.name}
      width={76}
      height={76}
      unoptimized
    />
  ) : (
    <span className="talent-portrait initials">
      {candidate.name
        .split(/\s+/)
        .slice(0, 2)
        .map((value) => value[0])
        .join("")}
    </span>
  );
}
function CompanyEditor({
  company,
  owner,
  locale,
  done,
}: {
  company: Company | null;
  owner: string;
  locale: Locale;
  done: (value: Company) => void;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const ar = locale === "ar";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await requestJSON<{ company: Company }>(
        "employer/company",
        "PUT",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      if (cloudUser() === owner) {
        done(result.company);
        setMessage(
          ar
            ? "تم حفظ ملف الشركة. الهوية معلنة ذاتيًا وليست موثقة."
            : "Company profile saved. Self-reported identity, not verified.",
        );
      }
    } catch {
      if (cloudUser() === owner)
        setMessage(
          ar
            ? "لم يُحفظ الملف؛ راجع البيانات والرابط الآمن."
            : "Not saved; check fields and the safe HTTPS website.",
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="company-editor">
      <h1>{ar ? "ملف شركتك ومسؤول التوظيف" : "Company & recruiter profile"}</h1>
      <p>
        {ar
          ? "إنشاء مساحة شركة خاصة لحسابك يمنح صلاحيات البحث والقائمة المختصرة لهذه المساحة فقط، وليس صلاحيات إدارة الموقع. بيانات الشركة معلنة منك، غير موثقة."
          : "Create an employer workspace owned by your account. It permits candidate search and your own shortlist, never site-admin access. Company identity is self-reported, not verified."}
      </p>
      <form onSubmit={submit}>
        {[
          ["name", ar ? "اسم الشركة" : "Company name"],
          ["recruiter", ar ? "اسم مسؤول التوظيف" : "Recruiter name"],
          ["industry", ar ? "المجال" : "Industry"],
          ["location", ar ? "المكان" : "Location"],
          [
            "website",
            ar ? "الموقع (اختياري، HTTPS)" : "Website (optional, HTTPS)",
          ],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              name={key}
              defaultValue={company?.[key as "name"] ?? ""}
              maxLength={key === "website" ? 300 : 160}
              minLength={key === "website" ? undefined : 2}
              required={key !== "website"}
            />
          </label>
        ))}
        <button className="talent-primary" disabled={busy}>
          {ar ? "احفظ ملف الشركة" : "Save company profile"}
        </button>
      </form>
      <p role="status">{message}</p>
      {company && (
        <Link href={`/${locale}/employer/candidates`}>
          {ar ? "افتح اكتشاف المرشحين" : "Open candidate discovery"}
        </Link>
      )}
    </section>
  );
}
function CandidatePreview({
  candidate,
  owner,
  locale,
  saved,
  busy,
  toggle,
  close,
}: {
  candidate: Candidate;
  owner: string;
  locale: Locale;
  saved: boolean;
  busy: boolean;
  toggle: () => void;
  close: () => void;
}) {
  const [tab, setTab] = useState("overview"),
    [cv, setCv] = useState<CvBlock[] | null>(null),
    [message, setMessage] = useState("");
  const ar = locale === "ar";
  useEffect(() => {
    let alive = true;
    setCv(null);
    setMessage("");
    if (tab === "cv" && candidate.cv)
      void requestJSON<{ blocks: CvBlock[] }>(
        `employer/candidates/${candidate.id}/cv`,
      )
        .then((data) => {
          if (alive && cloudUser() === owner) setCv(data.blocks);
        })
        .catch(() => {
          if (alive)
            setMessage(
              ar
                ? "المعاينة غير متاحة أو أُلغيت المشاركة."
                : "Preview unavailable or consent revoked.",
            );
        });
    return () => {
      alive = false;
    };
  }, [tab, candidate.id, candidate.cv, owner, ar]);
  async function contact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await requestJSON("employer/contact", "POST", {
        candidate: candidate.id,
        message: new FormData(event.currentTarget).get("message"),
      });
      if (cloudUser() === owner)
        setMessage(
          ar
            ? "وصل الطلب لصندوق المرشح الخاص، دون كشف هاتفه أو بريده."
            : "Request sent to the candidate's private inbox, without revealing email or phone.",
        );
    } catch {
      if (cloudUser() === owner)
        setMessage(
          ar
            ? "لم يُرسل الطلب؛ ربما تغيرت موافقة المرشح."
            : "Not sent; the candidate may have changed consent.",
        );
    }
  }
  return (
    <section
      className="talent-preview"
      aria-label={ar ? "معاينة المرشح" : "Candidate preview"}
    >
      <header className="preview-heading">
        <CandidatePortrait candidate={candidate} />
        <div>
          <h2>{candidate.name}</h2>
          <p>
            {candidate.currentRole || roleCatalog[candidate.role].label[locale]}
          </p>
          <small>{candidate.location}</small>
          <span className="talent-match">
            {candidate.skills.length}{" "}
            {ar ? "مهارات مدعومة" : "supported skills"}
          </span>
        </div>
        <button
          className="talent-primary preview-shortlist"
          disabled={busy}
          onClick={toggle}
        >
          {saved
            ? ar
              ? "إزالة من القائمة"
              : "Remove from shortlist"
            : ar
              ? "أضف للقائمة المختصرة"
              : "Add to shortlist"}
        </button>
        <button
          className="preview-close"
          onClick={close}
          aria-label={ar ? "إغلاق المعاينة" : "Close preview"}
        >
          <X />
        </button>
      </header>
      <nav className="preview-tabs">
        {[
          ["overview", ar ? "البروفايل" : "Profile"],
          ["skills", ar ? "المهارات" : "Skills"],
          ["projects", ar ? "الأعمال" : "Projects"],
          ["certificates", ar ? "الشهادات" : "Certificates"],
          ["cv", "CV"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="preview-body">
        {tab === "overview" && (
          <>
            <h3>{ar ? "نبذة" : "About"}</h3>
            <p>{candidate.summary}</p>
            <h3>{ar ? "المعلومات الأساسية" : "Key Information"}</h3>
            <div className="preview-info">
              {[
                [
                  ar ? "التعليم" : "Education",
                  candidate.education
                    .map(
                      (row) =>
                        `${row.institution} · ${row.degree} ${row.field}`,
                    )
                    .join(" / "),
                  GraduationCap,
                ],
                [
                  ar ? "التخرج" : "Graduation",
                  candidate.graduationYear ||
                    candidate.education[0]?.graduationYear,
                  Calendar,
                ],
                [ar ? "المكان" : "Location", candidate.location, MapPin],
                [
                  ar ? "التوفر" : "Availability",
                  candidate.availability === "work"
                    ? ar
                      ? "متاح للعمل"
                      : "Open to work"
                    : candidate.availability === "internship"
                      ? ar
                        ? "تدريب"
                        : "Internship"
                      : ar
                        ? "غير باحث حاليًا"
                        : "Not looking",
                  Clock,
                ],
                [
                  ar ? "نوع العمل" : "Work Type",
                  candidate.workType,
                  BriefcaseBusiness,
                ],
                [
                  ar ? "اللغات" : "Languages",
                  candidate.languages.join(" · "),
                  Languages,
                ],
              ].map(([label, value, Icon]) => {
                const InfoIcon = Icon as typeof MapPin;
                return (
                  <article key={String(label)}>
                    <InfoIcon />
                    <div>
                      <b>{String(label)}</b>
                      <small>{String(value || "—")}</small>
                    </div>
                  </article>
                );
              })}
            </div>
            <h3>{ar ? "أبرز المهارات" : "Top Skills"}</h3>
            {candidate.skills.slice(0, 4).map((row) => (
              <div className="preview-skill" key={row.skillId}>
                <span>{skillCatalog[row.skillId].label[locale]}</span>
                {row.score !== null ? (
                  <>
                    <progress
                      max={100}
                      value={row.score}
                      aria-label={skillCatalog[row.skillId].label[locale]}
                    />
                    <small>{row.score}%</small>
                  </>
                ) : (
                  <small>{row.status}</small>
                )}
              </div>
            ))}
            {!candidate.skills.length && (
              <p>
                {ar ? "لا توجد أدلة مهارات بعد." : "No skill evidence yet."}
              </p>
            )}
            <h3>
              {ar
                ? "عمل مميز (محاكاة تدريبية)"
                : "Highlighted Project (Simulation)"}
            </h3>
            {candidate.works[0] ? (
              <article className="preview-highlight">
                <Image
                  src="/game/first-shift-desk-v2.png"
                  width={68}
                  height={58}
                  alt=""
                />
                <div>
                  <b>{candidate.works[0].title[locale]}</b>
                  <p>{candidate.works[0].summary[locale]}</p>
                </div>
                <button onClick={() => setTab("projects")}>
                  {ar ? "عرض العمل" : "View project"}
                </button>
              </article>
            ) : (
              <p>
                {ar ? "لا توجد أعمال مقبولة بعد." : "No accepted work yet."}
              </p>
            )}
            <h3>
              {ar
                ? "الشهادات · مضافة من المرشح"
                : "Certificates · self-reported"}
            </h3>
            <div className="preview-certificates">
              {candidate.certificates.slice(0, 3).map((row, index) => (
                <article className="preview-certificate" key={index}>
                  <Award size={25} />
                  <div>
                    <b>{row.title}</b>
                    <small>
                      {row.issuer} · {row.date}
                    </small>
                  </div>
                </article>
              ))}
            </div>
            {!candidate.certificates.length && (
              <p>{ar ? "لم تتم مشاركة شهادات." : "No certificates shared."}</p>
            )}
            <footer className="preview-footer">
              <Link href={`/${locale}/employer/candidates/${candidate.id}`}>
                {ar ? "عرض البروفايل المشترك" : "View public profile"}
              </Link>
              {candidate.cv && (
                <button className="talent-primary" onClick={() => setTab("cv")}>
                  {ar ? "تنزيل CV" : "Download CV"}
                </button>
              )}
            </footer>
          </>
        )}
        {tab === "skills" && (
          <>
            <h3>
              {ar ? "مهارات مدعومة بالممارسة" : "Skills supported by practice"}
            </h3>
            <p>
              {ar
                ? "تقييم دليل محاكاة؛ ليس نسبة ملاءمة للتوظيف."
                : "Simulation evidence scores, not hiring-match percentages."}
            </p>
            {candidate.skills.map((row) => (
              <article className="preview-line" key={row.skillId}>
                <b>{skillCatalog[row.skillId].label[locale]}</b>
                <small>
                  {row.status} · {row.evidenceCount} {ar ? "دليل" : "evidence"}
                </small>
                {row.score !== null && (
                  <>
                    <progress
                      max={100}
                      value={row.score}
                      aria-label={skillCatalog[row.skillId].label[locale]}
                    />
                    <span>{row.score}%</span>
                  </>
                )}
              </article>
            ))}
            {!candidate.skills.length && (
              <p>
                {ar ? "لا توجد أدلة مهارات بعد." : "No skill evidence yet."}
              </p>
            )}
          </>
        )}
        {tab === "projects" && (
          <>
            <h3>
              {ar
                ? "محاكاة تدريبية، ليست خبرة توظيف"
                : "Training simulation, not employment"}
            </h3>
            {candidate.works.map((work) => (
              <article className="preview-work" key={work.id}>
                <h3>{work.title[locale]}</h3>
                <p>{work.summary[locale]}</p>
                <small>
                  {ar
                    ? "مصدر الدليل: مهام مقبولة بالخادم"
                    : "Evidence source: server-accepted tasks"}
                </small>
                <details>
                  <summary>
                    {ar ? "معاينة ورقة العمل" : "View workpaper"}
                  </summary>
                  <WorkPreview work={work} />
                </details>
              </article>
            ))}
            {!candidate.works.length && (
              <p>
                {ar
                  ? "لا توجد أعمال مقبولة متاحة."
                  : "No accepted work available."}
              </p>
            )}
          </>
        )}
        {tab === "certificates" && (
          <>
            <h3>
              {ar ? "بيانات شهادات معلنة ذاتيًا" : "Self-reported certificates"}
            </h3>
            <p>
              {ar
                ? "مرفوعة من المرشح وغير موثقة. الصور والأرقام الخاصة غير مشتركة."
                : "Uploaded by the candidate, not verified. Private images and credential IDs are not shared."}
            </p>
            {candidate.certificates.map((row, i) => (
              <article className="preview-line" key={i}>
                <FileText />
                <b>{row.title}</b>
                <small>
                  {row.issuer} · {row.date}
                </small>
              </article>
            ))}
            {!candidate.certificates.length && (
              <p>
                {ar
                  ? "لم تتم مشاركة بيانات شهادات."
                  : "No certificate metadata shared."}
              </p>
            )}
          </>
        )}
        {tab === "cv" && (
          <>
            <h3>
              {ar
                ? "معاينة CV إنجليزي بموافقة المرشح"
                : "Candidate-consented English CV preview"}
            </h3>
            <p>
              {ar
                ? "معاينة نصية دون بريد الحساب أو التليفون أو صور الشهادات."
                : "Text preview with account email, phone and certificate images removed."}
            </p>
            {candidate.cv ? (
              cv ? (
                <SharedCvView blocks={cv} />
              ) : (
                <p>
                  {message || (ar ? "تحميل المعاينة…" : "Loading preview…")}
                </p>
              )
            ) : (
              <p>
                {ar
                  ? "المرشح لم يسمح بمشاركة معاينة السيرة."
                  : "The candidate has not consented to a CV preview."}
              </p>
            )}
          </>
        )}
        {candidate.contactRequests && tab !== "overview" && (
          <details className="contact-request">
            <summary>
              {ar
                ? "طلب تواصل آمن داخل الموقع"
                : "Send a safe internal contact request"}
            </summary>
            <form onSubmit={contact}>
              <label>
                {ar
                  ? "رسالة مهنية (لا توجد عملية بريد خارجي تلقائية)"
                  : "Professional message (no automatic external email)"}
                <textarea
                  name="message"
                  minLength={10}
                  maxLength={1000}
                  required
                />
              </label>
              <button className="talent-primary">
                {ar ? "أرسل الطلب" : "Send request"}
              </button>
            </form>
          </details>
        )}
        <p role="status">{message}</p>
      </div>
    </section>
  );
}

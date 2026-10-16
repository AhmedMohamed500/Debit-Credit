"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness,
  CheckCircle2, ChevronDown, ChevronRight, Cloud, CloudOff, FileText,
  Globe2, GraduationCap, Grid2X2, Info, Mail, MapPin, Menu, RotateCw,
  Save, Settings2, ShieldCheck, Star, UserRound,
} from "lucide-react";
import { useCloudIdentity } from "./session-boundary";
import {
  requestJSON, CloudFailure, configureCloud, currentSyncStatus,
  pendingBackups, retryBackups, type CloudIdentity,
} from "@/lib/cloud/runtime";
import { CloudCacheRepository } from "@/lib/cloud/cache";
import { authClient } from "@/lib/auth/client";
import { ProfilePhoto } from "@/components/career/profile-photo";
import { useThemePreference } from "@/components/platform/theme-provider";
import type { PersonalRecord } from "@/lib/career/personal";
import type { Locale } from "@/types";

type PersonalResponse = { revision: number; data: PersonalRecord | null };
type SyncState = "ready" | "saving" | "saved" | "unsynced" | "conflict";
const personaLabels = {
  student: { ar: "طالب", en: "Student" },
  graduate: { ar: "خريج", en: "Graduate" },
  "working-accountant": { ar: "محاسب", en: "Accountant" },
  "experienced-accountant": { ar: "محاسب ذو خبرة", en: "Experienced accountant" },
};

export function CloudAccount({ locale }: { locale: Locale }) {
  const identity = useCloudIdentity();
  if (!identity) return <main className="account-settings-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <p className="account-settings-loading" role="status">{locale === "ar" ? "جارٍ تحميل إعدادات الحساب…" : "Loading account settings…"}</p>
  </main>;
  return <AccountSettings key={identity.user.id} locale={locale} identity={identity} />;
}

function AccountSettings({ locale, identity }: { locale: Locale; identity: CloudIdentity }) {
  const router = useRouter();
  const ar = locale === "ar";
  const say = (en: string, arabic: string) => ar ? arabic : en;
  const { preference, setPreference } = useThemePreference();
  const [savedProfile, setSavedProfile] = useState<CloudIdentity["profile"] | null>(null);
  const profile = savedProfile ?? identity.profile;
  const [displayName, setDisplayName] = useState(identity.profile.displayName);
  const [handle, setHandle] = useState(identity.profile.handle);
  const [avatar, setAvatar] = useState(identity.profile.avatar);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [personal, setPersonal] = useState<PersonalRecord | null>(null);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [sync, setSync] = useState<SyncState>(() => currentSyncStatus() as SyncState);
  const [pendingCount, setPendingCount] = useState(() => pendingBackups());
  const [syncMessage, setSyncMessage] = useState("");
  const [signOutError, setSignOutError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void requestJSON<PersonalResponse>("me/personal")
      .then((record) => { if (active) setPersonal(record.data); })
      .catch(() => { if (active) setPersonal(null); });
    return () => { active = false; };
  }, [identity.user.id]);

  useEffect(() => {
    const update = () => {
      setSync(currentSyncStatus() as SyncState);
      setPendingCount(pendingBackups());
    };
    update();
    window.addEventListener("app-sync-status", update);
    return () => window.removeEventListener("app-sync-status", update);
  }, [identity.user.id]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveMessage("");
    setSaveError(false);
    try {
      const saved = await requestJSON<CloudIdentity["profile"]>("me/profile", "PUT", {
        displayName: displayName.trim(),
        handle: handle.trim(),
        avatar,
        locale: profile.locale,
        persona: profile.persona,
        targetRoleId: profile.targetRoleId,
        revision: profile.updatedAt,
      });
      setSavedProfile(saved);
      setDisplayName(saved.displayName);
      setHandle(saved.handle);
      setAvatar(saved.avatar);
      setSaveMessage(say("Changes saved to your account.", "تم حفظ التغييرات في حسابك."));
    } catch (error) {
      setSaveError(true);
      setSaveMessage(error instanceof CloudFailure && error.status === 409
        ? say("This profile changed elsewhere, or the handle is taken. Your edits are still here; reload to review before retrying.", "تغيّر الملف في مكان آخر أو المعرّف مستخدم. تعديلاتك ما زالت هنا؛ راجع الصفحة قبل المحاولة مجددًا.")
        : say("Changes were not saved. Your edits are still here; check your connection and retry.", "لم تُحفظ التغييرات. تعديلاتك ما زالت هنا؛ راجع الاتصال وحاول ثانية."));
    } finally {
      setSaving(false);
    }
  }

  async function sendVerification() {
    if (verificationBusy || identity.user.emailVerified || !identity.capabilities.email) return;
    setVerificationBusy(true);
    setVerificationMessage("");
    try {
      const result = await authClient.sendVerificationEmail({
        email: identity.user.email,
        callbackURL: "/" + locale + "/account",
      });
      setVerificationMessage(result.error
        ? say("Verification request failed. Please retry.", "تعذّر طلب التحقق. حاول ثانية.")
        : say("Verification email requested. Check your inbox; status updates after you confirm the link.", "تم طلب رسالة التحقق. راجع بريدك؛ تتحدث الحالة بعد تأكيد الرابط."));
    } catch {
      setVerificationMessage(say("Email service is unavailable. Try again later.", "خدمة البريد غير متاحة الآن. حاول لاحقًا."));
    } finally {
      setVerificationBusy(false);
    }
  }

  async function signOut() {
    if (pendingBackups() && !window.confirm(say(
      "Some local backups are not synced. Sign out anyway?",
      "بعض النسخ المحلية لم تُحفظ سحابيًا. هل تريد الخروج؟",
    ))) return;
    setSignOutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("SIGN_OUT_FAILED");
      configureCloud(null);
      new CloudCacheRepository().restoreGuest();
      window.location.assign(new URL("/" + locale, window.location.origin).href);
    } catch {
      setSignOutError(say("Sign out failed. Please retry.", "تعذّر تسجيل الخروج. حاول ثانية."));
    }
  }

  const savedLocation = personal?.details.location?.trim() || "";
  const savedCountry = personal?.details.country?.trim() || "";
  const location = savedLocation && savedCountry && !savedLocation.toLocaleLowerCase().includes(savedCountry.toLocaleLowerCase())
    ? savedLocation + ", " + savedCountry
    : savedLocation || savedCountry;
  const persona = profile.persona ? personaLabels[profile.persona]?.[locale] : "";
  const syncView: SyncState = pendingCount > 0 && (sync === "ready" || sync === "saved") ? "unsynced" : sync;
  const syncTitle = syncView === "saving"
    ? say("Saving in progress", "جارٍ الحفظ")
    : syncView === "conflict"
      ? say("Revision conflict", "تعارض في النسخة")
      : syncView === "unsynced"
        ? say("Not synced yet", "لم تتم المزامنة بعد")
        : syncView === "saved"
          ? say("Latest operation confirmed", "تم تأكيد آخر عملية حفظ")
          : say("No pending local backups", "لا توجد نسخ محلية معلقة");
  const syncDetail = syncView === "conflict"
    ? say("Cloud data was not overwritten. Review the conflicting change before retrying.", "لم تُستبدل بيانات الخادم. راجع التغيير المتعارض قبل إعادة المحاولة.")
    : pendingCount > 0
    ? say(String(pendingCount) + " local backup(s) waiting to be sent.", String(pendingCount) + " من النسخ المحلية تنتظر الإرسال.")
      : syncView === "unsynced"
        ? say("A cloud operation was not confirmed. No local backup is available to retry here.", "لم تتأكد إحدى عمليات الحفظ. لا توجد نسخة محلية يمكن إعادة إرسالها من هنا.")
        : syncView === "saved"
          ? say("The last cloud operation was confirmed; this is not a guarantee for every feature.", "أكد الخادم آخر عملية فقط؛ ولا يعني ذلك ضمان حفظ كل بيانات الموقع.")
          : say("Local backup queue is clear. Individual changes are confirmed when each save succeeds.", "قائمة النسخ المحلية خالية. يتأكد كل تعديل عند نجاح عملية حفظه.");
  const SyncIcon = syncView === "unsynced" || syncView === "conflict" ? CloudOff : syncView === "saving" ? RotateCw : Cloud;

  const navLinks = [
    ["", say("Home", "الرئيسية")],
    ["/academy", say("Learning paths", "المسارات التعليمية")],
    ["/account-guide", say("Accounting library", "المكتبة المحاسبية")],
    ["/pricing", say("Pricing", "التسعير")],
    ["/employers", say("For companies", "للشركات")],
  ] as const;
  const importantLinks = [
    { href: "/" + locale, icon: BookOpen, title: say("My journey", "رحلتي"), detail: say("Continue learning and practical training", "متابعة مسارك التعليمي والتدريب العملي") },
    { href: "/" + locale + "/career-profile", icon: BriefcaseBusiness, title: say("Career profile", "الملف المهني"), detail: say("Your professional information and skills", "معلوماتك المهنية ومهاراتك") },
    { href: "/" + locale + "/career-profile/skills", icon: Star, title: say("Skill Passport", "جواز المهارات"), detail: say("Evidence from your simulations", "أدلة مهاراتك من المحاكاة") },
    { href: "/" + locale + "/career-profile/cv", icon: FileText, title: say("English CV", "الـCV الإنجليزي"), detail: say("View and download your CV", "عرض وتحميل سيرتك المهنية") },
    { href: "/" + locale + "/career-league/map", icon: GraduationCap, title: say("Career path", "المسار المهني"), detail: say("Explore roles and career opportunities", "استكشاف الأدوار والفرص المهنية") },
  ];

  return <main className="account-settings-page" dir={ar ? "rtl" : "ltr"}>
    <header className="account-settings-nav">
      <Link className="account-settings-brand" href={"/" + locale} aria-label="Debit & Credit">
        <BookOpen aria-hidden="true" /><span><strong>Debit &amp; Credit</strong><small>{say("Learn accounting by doing", "تعلم المحاسبة بالممارسة")}</small></span>
      </Link>
      <nav className={"account-settings-nav-links" + (menuOpen ? " is-open" : "")} aria-label={say("Main navigation", "التنقل الرئيسي")}>
        {navLinks.map(([path, label]) => <Link key={path} href={"/" + locale + path}>{label}</Link>)}
      </nav>
      <div className="account-settings-nav-actions">
        <button className="account-settings-nav-menu" type="button" aria-label={say("Open navigation", "افتح القائمة")} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><Menu aria-hidden="true" /></button>
        <Link href={"/" + (ar ? "en" : "ar") + "/account"} aria-label={say("Switch to Arabic", "Switch to English")}><Globe2 aria-hidden="true" />{ar ? "EN" : "AR"}</Link>
        <details className="account-settings-account-menu">
          <summary aria-label={say("Account menu", "قائمة الحساب")}>
            <ProfilePhoto locale={locale} name={profile.displayName} /><span>{profile.displayName}</span><ChevronDown aria-hidden="true" />
          </summary>
          <div>
            <Link href={"/" + locale + "/account"}>{say("Account settings", "إعدادات الحساب")}</Link>
            <Link href={"/" + locale + "/career-profile"}>{say("Career profile", "الملف المهني")}</Link>
            <Link href={"/" + locale + "/competition"}>{say("Competition", "المنافسة")}</Link>
            {identity.user.role === "ADMIN" && <Link href={"/" + locale + "/admin"}>{say("Admin", "الإدارة")}</Link>}
            <button type="button" onClick={signOut}>{say("Sign out", "تسجيل الخروج")}</button>
            {signOutError && <p role="alert">{signOutError}</p>}
          </div>
        </details>
      </div>
    </header>

    <section className="account-settings-hero" aria-labelledby="account-settings-title">
      <div className="account-settings-hero-copy">
        <h1 id="account-settings-title">{say("Account Settings", "إعدادات الحساب")}</h1>
        <p>{say("Manage your account, security and preferences", "إدارة بياناتك وأمان حسابك وإعداداتك")}</p>
        <small>{say("Your information in one place", "معلوماتك في مكان واحد")}</small>
      </div>
      <div className="account-settings-identity">
        <div className="account-settings-identity-photo"><ProfilePhoto locale={locale} name={profile.displayName} /></div>
        <div className="account-settings-identity-copy">
          <h2>{profile.displayName}</h2>
          {persona && <span className="account-settings-persona">{persona}</span>}
          <p dir="ltr">{identity.user.email} {identity.user.emailVerified && <BadgeCheck aria-label={say("Email verified", "البريد موثّق")} size={15} />}</p>
          {location && <small><MapPin aria-hidden="true" size={14} />{location}</small>}
        </div>
        <Link href={"/" + locale + "/career-profile"}>{say("View career profile", "عرض الملف المهني")}<ArrowRight aria-hidden="true" size={16} /></Link>
      </div>
    </section>

    <div className="account-settings-main"><div className="account-settings-grid">
      <section className="account-settings-details account-settings-card" aria-labelledby="account-details-title">
        <div className="account-settings-card-heading"><span><UserRound aria-hidden="true" /></span><div><h2 id="account-details-title">{say("Account details", "بيانات الحساب")}</h2><p>{say("Your name, handle and profile photo", "الاسم والمعرّف والصورة والمعلومات الأساسية")}</p></div></div>
        <form onSubmit={saveProfile}>
          <div className="account-settings-details-inner">
            <div className="account-settings-photo"><ProfilePhoto locale={locale} editable compact name={profile.displayName} /></div>
            <div className="account-settings-fields">
              <div className="account-settings-field"><label htmlFor="account-display-name">{say("Display name", "الاسم المعروض")}</label><input id="account-display-name" name="displayName" value={displayName} onChange={(e) => { setDisplayName(e.target.value); setSaveMessage(""); }} minLength={2} maxLength={60} required autoComplete="name" /></div>
              <div className="account-settings-field"><label htmlFor="account-handle">{say("Public handle", "المعرّف العام")}</label><input id="account-handle" name="handle" dir="ltr" value={handle} onChange={(e) => { setHandle(e.target.value); setSaveMessage(""); }} pattern="[a-z0-9](?:[a-z0-9]|-){2,29}" required autoCapitalize="none" spellCheck={false} /></div>
              <div className="account-settings-field"><label htmlFor="account-email">{say("Email address", "البريد الإلكتروني")}</label><input id="account-email" dir="ltr" value={identity.user.email} readOnly /></div>
              {location && <div className="account-settings-field"><label htmlFor="account-location">{say("Location (career profile)", "الموقع (الملف المهني)")}</label><input id="account-location" value={location} readOnly /><Link href={"/" + locale + "/career-profile/edit"}>{say("Edit in career profile", "تعديله في الملف المهني")}</Link></div>}
            </div>
          </div>
          <div className="account-settings-avatar-setting"><label htmlFor="account-avatar">{say("Fallback avatar color", "لون الصورة الرمزية البديلة")}</label><select id="account-avatar" value={avatar} onChange={(e) => setAvatar(e.target.value as CloudIdentity["profile"]["avatar"])}><option value="blue">{say("Blue", "أزرق")}</option><option value="green">{say("Green", "أخضر")}</option><option value="gold">{say("Gold", "ذهبي")}</option><option value="purple">{say("Purple", "بنفسجي")}</option></select></div>
          <button className="account-settings-save" type="submit" disabled={saving}><Save aria-hidden="true" />{saving ? say("Saving…", "جارٍ الحفظ…") : say("Save changes", "حفظ التغييرات")}</button>
          {saveMessage && <p className={"account-settings-feedback" + (saveError ? " is-error" : "")} role={saveError ? "alert" : "status"}>{saveMessage}</p>}
        </form>
      </section>

      <div className="account-settings-middle">
        <section className="account-settings-card" aria-labelledby="account-security-title">
          <div className="account-settings-card-heading"><span><ShieldCheck aria-hidden="true" /></span><div><h2 id="account-security-title">{say("Security", "الأمان")}</h2><p>{say("Email and verification", "البريد الإلكتروني والتحقق من الحساب")}</p></div></div>
          <div className="account-settings-security-state" data-verified={identity.user.emailVerified}>
            {identity.user.emailVerified ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
            <div><b>{say("Email address", "البريد الإلكتروني")}</b><p dir="ltr">{identity.user.email}</p><strong>{identity.user.emailVerified ? say("Verified email", "تم التحقق من البريد الإلكتروني") : say("Email not verified", "البريد الإلكتروني غير موثّق")}</strong></div>
          </div>
          {!identity.user.emailVerified && identity.capabilities.email && <button type="button" disabled={verificationBusy} onClick={sendVerification}><Mail aria-hidden="true" size={17} />{verificationBusy ? say("Requesting…", "جارٍ الطلب…") : say("Send verification link", "إرسال رابط التحقق")}</button>}
          {!identity.user.emailVerified && !identity.capabilities.email && <p className="account-settings-hint">{say("Email verification is not available for this sign-in method.", "التحقق بالبريد غير متاح لطريقة الدخول الحالية.")}</p>}
          {verificationMessage && <p role="status" className="account-settings-feedback">{verificationMessage}</p>}
        </section>
        <section className="account-settings-card" aria-labelledby="account-preferences-title">
          <div className="account-settings-card-heading"><span><Settings2 aria-hidden="true" /></span><div><h2 id="account-preferences-title">{say("Account preferences", "تفضيلات الحساب")}</h2><p>{say("Language and appearance", "اللغة والمظهر")}</p></div></div>
          <div className="account-settings-preference-row"><label htmlFor="account-language">{say("Language", "اللغة")}</label><select id="account-language" value={locale} onChange={(e) => { router.push("/" + e.target.value + "/account"); }}><option value="ar">العربية</option><option value="en">English</option></select><Globe2 aria-hidden="true" size={18} /></div>
          <div className="account-settings-preference-row"><label htmlFor="account-theme">{say("Appearance", "المظهر")}</label><select id="account-theme" value={preference} onChange={(e) => setPreference(e.target.value as "light" | "dark" | "system")}><option value="light">{say("Light", "فاتح")}</option><option value="dark">{say("Dark", "داكن")}</option><option value="system">{say("System", "النظام")}</option></select></div>
        </section>
        <section className="account-settings-card" aria-labelledby="account-info-title">
          <div className="account-settings-card-heading"><span><Info aria-hidden="true" /></span><div><h2 id="account-info-title">{say("Important information", "معلومات مهمة")}</h2></div></div>
          <div className="account-settings-info"><ul><li>{say("Your email stays private; public sharing is managed in your career profile.", "بريدك خاص؛ إعدادات المشاركة العامة تُدار من الملف المهني.")}</li><li>{say("Each account change is confirmed only after its save succeeds.", "يتأكد كل تعديل في الحساب بعد نجاح حفظه فقط.")}</li><li>{say("Edit your professional details and visibility in the career profile.", "عدّل بياناتك المهنية وظهورها في الملف المهني.")}</li></ul></div>
        </section>
      </div>

      <div className="account-settings-side">
        <section className="account-settings-card" aria-labelledby="account-sync-title">
          <div className="account-settings-card-heading"><span><Cloud aria-hidden="true" /></span><div><h2 id="account-sync-title">{say("Sync and save data", "المزامنة وحفظ البيانات")}</h2><p>{say("Status of supported cloud operations", "حالة عمليات الحفظ المدعومة")}</p></div></div>
          <div className="account-settings-sync-state" data-state={syncView}><SyncIcon aria-hidden="true" /><div><b>{syncTitle}</b><p>{syncDetail}</p></div></div>
          <button type="button" disabled={pendingCount === 0 || syncView === "saving" || syncView === "conflict"} onClick={() => { setSyncMessage(""); retryBackups(); setSyncMessage(say("Retry started for pending local backups. Check the status above for confirmation.", "بدأت إعادة إرسال النسخ المحلية المعلقة. راجع الحالة أعلاه للتأكد من النتيجة.")); }}><RotateCw aria-hidden="true" size={17} />{say("Sync now", "مزامنة الآن")}</button>
          {syncMessage && <p role="status" className="account-settings-feedback">{syncMessage}</p>}
          <p className="account-settings-hint"><Info aria-hidden="true" size={16} />{say("Only queued local backups can be retried here. Other saves show their own confirmation.", "يمكن إعادة إرسال النسخ المحلية المعلقة فقط هنا. بقية التعديلات لها تأكيد حفظ منفصل.")}</p>
        </section>
        <section className="account-settings-card" aria-labelledby="account-links-title">
          <div className="account-settings-card-heading"><span><Grid2X2 aria-hidden="true" /></span><div><h2 id="account-links-title">{say("Important links", "روابط مهمة")}</h2><p>{say("Quick access to key pages", "الوصول السريع لأهم الصفحات")}</p></div></div>
          {importantLinks.map(({ href, icon: Icon, title, detail }) => <Link className="account-settings-link-row" href={href} key={href}><span><Icon aria-hidden="true" /></span><span><b>{title}</b><small>{detail}</small></span><ChevronRight aria-hidden="true" /></Link>)}
        </section>
      </div>
    </div></div>
  </main>;
}

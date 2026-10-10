"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Info,
  LoaderCircle,
  Mail,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/safe-next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { PasswordField } from "@/components/auth/password-field";
import type { Locale } from "@/types";

export function AuthForm({
  locale,
  signup,
  next,
  enabled,
  google,
  email,
  registered = false,
}: {
  locale: Locale;
  signup: boolean;
  next: string;
  enabled: boolean;
  google: boolean;
  email: boolean;
  registered?: boolean;
}) {
  const router = useRouter();
  const ar = locale === "ar",
    say = (en: string, a: string) => (ar ? a : en),
    destination = safeNext(next, locale),
    authenticatedDestination = `/${locale}/auth/continue?next=${encodeURIComponent(destination)}`,
    loginURL = `/${locale}/login?next=${encodeURIComponent(destination)}&registered=1`;
  const [operation, setOperation] = useState<
    "email" | "google" | "reset" | null
  >(null);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [resetOpen, setResetOpen] = useState(false);
  const busy = useRef(false),
    pending = operation !== null;
  const connectionError = () =>
    say(
      "We couldn't connect. Please try again. Your account has not been confirmed.",
      "تعذّر الاتصال بالخادم. حاول مرة أخرى؛ لم يتم تأكيد العملية.",
    );
  function authError(code?: string) {
    if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "INVALID_PASSWORD")
      return say(
        "The email or password is incorrect. Please check your details.",
        "البريد الإلكتروني أو كلمة المرور غير صحيحة. راجع بياناتك.",
      );
    if (
      code === "USER_ALREADY_EXISTS" ||
      code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    )
      return say(
        "We couldn't create an account with this email. Try signing in instead.",
        "تعذّر إنشاء حساب بهذا البريد. جرّب تسجيل الدخول بدلًا من ذلك.",
      );
    if (code === "TOO_MANY_REQUESTS")
      return say(
        "Too many attempts. Please wait a moment and try again.",
        "محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.",
      );
    return signup
      ? say(
          "We couldn't create your account. Check your details and try again.",
          "تعذّر إنشاء الحساب. راجع بياناتك وحاول مرة أخرى.",
        )
      : say(
          "We couldn't sign you in. Please try again.",
          "تعذّر تسجيل الدخول. حاول مرة أخرى.",
        );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !enabled) return;
    const data = new FormData(event.currentTarget),
      password = String(data.get("password") ?? "");
    setMessage("");
    if (signup && password !== data.get("confirm")) {
      setError(say("Passwords do not match.", "كلمتا المرور غير متطابقتين."));
      return;
    }
    busy.current = true;
    setOperation("email");
    setError("");
    try {
      const fields = {
        email: String(data.get("email")),
        password,
      };
      const result = signup
        ? await authClient.signUp.email({
            ...fields,
            name: String(data.get("name")),
            callbackURL: loginURL,
          })
        : await authClient.signIn.email({
            ...fields,
            callbackURL: authenticatedDestination,
          });
      if (result.error) {
        setError(authError(result.error.code));
        return;
      }
      // Signup creates credentials only; the server deliberately creates no
      // session until the user submits the separate sign-in form.
      if (signup) {
        router.replace(loginURL);
        return;
      }
      // Better Auth's installed client already navigates when email sign-in
      // returns redirect:true. Do not start a second competing navigation.
      const sdkRedirect =
        result.data && "redirect" in result.data && result.data.redirect;
      if (!sdkRedirect) window.location.assign(new URL(authenticatedDestination, window.location.origin).href);
    } catch {
      setError(connectionError());
    } finally {
      busy.current = false;
      setOperation(null);
    }
  }
  async function googleSignIn() {
    if (busy.current || !enabled || !google) return;
    busy.current = true;
    setOperation("google");
    setError("");
    setMessage("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: authenticatedDestination,
      });
      if (result.error)
        setError(
          say(
            "Google sign-in is unavailable right now. Please try again.",
            "Google غير متاح حاليًا. حاول مرة أخرى.",
          ),
        );
    } catch {
      setError(connectionError());
    } finally {
      busy.current = false;
      setOperation(null);
    }
  }
  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !enabled || !email) return;
    const value = String(
      new FormData(event.currentTarget).get("reset-email") ?? "",
    );
    busy.current = true;
    setOperation("reset");
    setError("");
    setMessage("");
    try {
      const result = await authClient.requestPasswordReset({
        email: value,
        redirectTo: `/${locale}/reset-password`,
      });
      if (result.error)
        setError(
          say(
            "We couldn't send the request. Please try again.",
            "تعذّر إرسال الطلب. حاول مرة أخرى.",
          ),
        );
      else
        setMessage(
          say(
            "Request accepted. If this email has an account, check its inbox.",
            "تم قبول الطلب. إذا كان البريد مسجلًا فراجع الوارد.",
          ),
        );
    } catch {
      setError(connectionError());
    } finally {
      busy.current = false;
      setOperation(null);
    }
  }
  function invalid(event: React.InvalidEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(
      say(
        "Check your email and complete the required fields. New passwords need at least 12 characters.",
        "راجع البريد وأكمل الحقول المطلوبة. كلمة المرور الجديدة يجب أن تكون 12 حرفًا على الأقل.",
      ),
    );
  }
  const Arrow = ar ? ArrowLeft : ArrowRight;
  return (
    <AuthShell locale={locale}>
      <AuthFormCard locale={locale} signup={signup} enabled={enabled}>
        <GoogleAuthButton
          locale={locale}
          available={enabled && google}
          pending={operation === "google"}
          busy={pending}
          onClick={() => void googleSignIn()}
        />
        {!google && (
          <small id="auth-google-notice" className="auth-availability">
            {say(
              "Google sign-in is currently unavailable.",
              "Google غير متاح حاليًا.",
            )}
          </small>
        )}
        <div className="auth-divider">
          <span>{say("or use your email", "أو")}</span>
        </div>
        {!signup && registered && (
          <p className="auth-feedback" role="status">
            {say(
              "Sign in with your account details to start using the site.",
              "سجّل الدخول ببيانات حسابك لتبدأ استخدام الموقع.",
            )}
          </p>
        )}
        <form
          className="auth-email-form"
          onSubmit={submit}
          onInvalid={invalid}
          aria-busy={operation === "email"}
          aria-describedby={error ? "auth-error" : undefined}
        >
          {signup && (
            <div className="auth-field">
              <label htmlFor="auth-name">
                {say("Display name", "الاسم المعروض")}
              </label>
              <div className="auth-input-wrap">
                <UserRound className="auth-input-icon" aria-hidden="true" />
                <input
                  id="auth-name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={60}
                  disabled={pending}
                  placeholder={say("e.g. Ahmed Mohamed", "مثال: أحمد محمد")}
                />
              </div>
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">
              {say("Email", "البريد الإلكتروني")}
            </label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" aria-hidden="true" />
              <input
                id="auth-email"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                maxLength={254}
                required
                disabled={pending}
                placeholder="example@domain.com"
              />
            </div>
          </div>
          <PasswordField locale={locale} signup={signup} disabled={pending} />
          {signup && (
            <PasswordField locale={locale} signup confirm disabled={pending} />
          )}
          {!enabled && (
            <p className="auth-service-notice" role="status">
              <Info aria-hidden="true" />
              <span>
                {say(
                  "Account sign-up and sign-in are temporarily unavailable. You can still explore and practise locally.",
                  "إنشاء الحساب والدخول غير متاحين مؤقتًا. يمكنك الاستكشاف والتعلّم المحلي الآن.",
                )}
              </span>
            </p>
          )}
          <button
            type="submit"
            className="auth-submit"
            disabled={pending || !enabled}
          >
            {operation === "email" ? (
              <>
                <LoaderCircle className="auth-spinner" aria-hidden="true" />
                {signup
                  ? say("Creating your account…", "جارٍ إنشاء حسابك…")
                  : say("Signing you in…", "جارٍ تسجيل الدخول…")}
              </>
            ) : (
              <>
                {signup
                  ? say("Create free account", "إنشاء حساب مجاني")
                  : say("Sign in", "تسجيل الدخول")}
                <Arrow aria-hidden="true" />
              </>
            )}
          </button>
        </form>
        {!signup && email && enabled && (
          <div className="auth-reset">
            <button
              type="button"
              className="auth-text-button"
              disabled={pending}
              aria-expanded={resetOpen}
              aria-controls="auth-reset-form"
              onClick={() => setResetOpen(!resetOpen)}
            >
              {say("Forgot password?", "نسيت كلمة المرور؟")}
            </button>
            {resetOpen && (
              <form id="auth-reset-form" onSubmit={resetPassword}>
                <label htmlFor="auth-reset-email">
                  {say("Your account email", "بريد حسابك")}
                </label>
                <input
                  id="auth-reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
                <button
                  type="submit"
                  className="auth-reset-submit"
                  disabled={pending}
                >
                  {operation === "reset"
                    ? say("Sending…", "جارٍ الإرسال…")
                    : say("Send reset link", "إرسال رابط الاستعادة")}
                </button>
              </form>
            )}
          </div>
        )}
        {error && (
          <p
            className="auth-feedback auth-feedback-error"
            role="alert"
            id="auth-error"
          >
            <CircleAlert aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
        {message && (
          <p className="auth-feedback" role="status">
            {message}
          </p>
        )}
        <div className="auth-switch">
          <span>
            {signup
              ? say("Already have an account?", "لديك حساب بالفعل؟")
              : say("New to Debit & Credit?", "ليس لديك حساب؟")}
          </span>
          <Link
            href={`/${locale}/${signup ? "login" : "signup"}?next=${encodeURIComponent(destination)}`}
            aria-label={
              signup
                ? say(
                    "Already have an account? Sign in",
                    "لديك حساب؟ سجّل الدخول",
                  )
                : say("Create an account", "إنشاء حساب جديد")
            }
          >
            {signup
              ? say("Sign in", "سجّل الدخول")
              : say("Create a free account", "أنشئ حسابًا مجانيًا")}
          </Link>
        </div>
        {!enabled && (
          <div className="auth-guest-entry">
            <Link className="auth-guest-link" href={`/${locale}/onboarding`}>
              {say(
                "Continue as a guest — no account",
                "المتابعة كضيف — بدون حساب",
              )}
              <Arrow aria-hidden="true" />
            </Link>
            <p>
              {say(
                "Guest progress stays on this device. This does not create a cloud account.",
                "تقدم الضيف يُحفظ على هذا الجهاز فقط. هذا الخيار لا يُنشئ حسابًا سحابيًا.",
              )}
            </p>
          </div>
        )}
      </AuthFormCard>
    </AuthShell>
  );
}

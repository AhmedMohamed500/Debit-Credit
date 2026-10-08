import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/cloud/auth-form";

const auth = vi.hoisted(() => ({
  signup: vi.fn(),
  login: vi.fn(),
  social: vi.fn(),
  reset: vi.fn(),
}));
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signUp: { email: auth.signup },
    signIn: { email: auth.login, social: auth.social },
    requestPasswordReset: auth.reset,
  },
}));
vi.mock("next/image", () => ({
  default: () => <span data-testid="decorative-art" />,
}));

const props = {
  locale: "en" as const,
  signup: true,
  next: "/en/onboarding",
  enabled: true,
  google: false,
  email: false,
};
function fillSignup() {
  fireEvent.change(screen.getByLabelText("Display name"), {
    target: { value: "Routing Learner" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "learner@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "routing-test-password" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "routing-test-password" },
  });
}
beforeEach(() => {
  vi.resetAllMocks();
});
afterEach(() => cleanup());

describe("real auth UI contract", () => {
  it("does not add a second navigation when the installed client handles a confirmed login redirect", async () => {
    auth.login.mockResolvedValue({
      error: null,
      data: { redirect: true, url: "/en/onboarding" },
    });
    render(<AuthForm {...props} signup={false} />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "learner@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "routing-test-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled(),
    );
    expect(auth.login).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: "/en/onboarding" }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("replaces default invalid-field popups with localized inline guidance", () => {
    render(<AuthForm {...props} />);
    fireEvent.invalid(screen.getByLabelText("Email"));
    expect(screen.getByRole("alert")).toHaveTextContent("Check your email");
    expect(auth.signup).not.toHaveBeenCalled();
  });
  it("blocks repeated social requests while showing Google loading feedback", async () => {
    let settle!: (value: { error: { code: string } }) => void;
    auth.social.mockImplementation(
      () =>
        new Promise((resolve) => {
          settle = resolve;
        }),
    );
    render(<AuthForm {...props} google />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    const opening = screen.getByRole("button", { name: "Opening Google…" });
    expect(opening).toBeDisabled();
    fireEvent.click(opening);
    expect(auth.social).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Create free account" }),
    ).toBeDisabled();
    settle({ error: { code: "PROVIDER_NOT_FOUND" } });
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("unavailable"),
    );
  });
  it("sends reset requests through the existing auth client with a localized reset destination", async () => {
    auth.reset.mockResolvedValue({ error: null });
    render(<AuthForm {...props} signup={false} email />);
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fireEvent.change(screen.getByLabelText("Your account email"), {
      target: { value: "learner@example.test" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Send reset link" }).closest("form")!,
    );
    await waitFor(() =>
      expect(auth.reset).toHaveBeenCalledWith({
        email: "learner@example.test",
        redirectTo: "/en/reset-password",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "If this email has an account",
    );
  });
  it("renders labelled real fields and the server's 12-character signup policy", () => {
    render(<AuthForm {...props} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "minlength",
      "12",
    );
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "minlength",
      "12",
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(
      screen.getByRole("heading", { name: "Create your free account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Illustrative platform progress"),
    ).toHaveTextContent("A preview of your learning experience");
  });
  it("reveals each password independently without recreating or clearing its input", () => {
    render(<AuthForm {...props} />);
    fillSignup();
    const password = screen.getByLabelText("Password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("routing-test-password");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute(
      "type",
      "password",
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });
  it("keeps unavailable services honest without developer warnings or sync claims", () => {
    render(<AuthForm {...props} enabled={false} />);
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Create free account" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "temporarily unavailable",
    );
    expect(
      screen.queryByText(/not configured|supported devices/i),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    expect(auth.social).not.toHaveBeenCalled();
  });
  it("rejects mismatched confirmation before making a signup request", () => {
    render(<AuthForm {...props} />);
    fillSignup();
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different-password" },
    });
    fireEvent.submit(
      screen
        .getByRole("button", { name: "Create free account" })
        .closest("form")!,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Passwords do not match",
    );
    expect(auth.signup).not.toHaveBeenCalled();
  });
  it("blocks duplicate submissions, shows loading and never reports a failed request as success", async () => {
    let settle!: (value: { error: { code: string } }) => void;
    auth.signup.mockImplementation(
      () =>
        new Promise((resolve) => {
          settle = resolve;
        }),
    );
    render(<AuthForm {...props} />);
    fillSignup();
    const form = screen
      .getByRole("button", { name: "Create free account" })
      .closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(auth.signup).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Creating your account…" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    settle({ error: { code: "USER_ALREADY_EXISTS" } });
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Try signing in instead",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Create free account" }),
    ).toBeEnabled();
    expect(auth.signup).toHaveBeenCalledWith(
      expect.objectContaining({ callbackURL: "/en/onboarding" }),
    );
  });
  it("uses the real social client method with a safe destination, not the provider callback", async () => {
    auth.social.mockResolvedValue({ error: { code: "PROVIDER_NOT_FOUND" } });
    render(<AuthForm {...props} google next="https://unsafe.example" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    await waitFor(() =>
      expect(auth.social).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/en/onboarding",
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Google sign-in is unavailable",
    );
  });
  it("shows connection failures inline without rendering internal exception details", async () => {
    auth.signup.mockRejectedValue(new Error("private-server-stack"));
    render(<AuthForm {...props} />);
    fillSignup();
    fireEvent.submit(
      screen
        .getByRole("button", { name: "Create free account" })
        .closest("form")!,
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("couldn't connect"),
    );
    expect(screen.queryByText(/private-server-stack/)).not.toBeInTheDocument();
  });
  it("keeps login policy, error feedback and safe signup links", async () => {
    auth.login.mockResolvedValue({
      error: { code: "INVALID_EMAIL_OR_PASSWORD" },
    });
    render(<AuthForm {...props} signup={false} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "1");
    expect(screen.queryByLabelText("Confirm password")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "learner@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "email or password is incorrect",
      ),
    );
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/en/signup?next=%2Fen%2Fonboarding");
  });
  it("renders Arabic labels, direction and localized navigation", () => {
    render(<AuthForm {...props} locale="ar" next="/ar/onboarding" />);
    expect(screen.getByLabelText("الاسم المعروض")).toBeInTheDocument();
    expect(
      screen
        .getByRole("heading", { name: "أنشئ حسابك المجاني" })
        .closest(".auth-form-side"),
    ).toHaveAttribute("dir", "rtl");
    expect(
      screen.getByRole("link", { name: "لديك حساب؟ سجّل الدخول" }),
    ).toHaveAttribute("href", "/ar/login?next=%2Far%2Fonboarding");
  });
  it("only offers password reset when email delivery and backend are configured", () => {
    const { rerender } = render(<AuthForm {...props} signup={false} />);
    expect(
      screen.queryByRole("button", { name: "Forgot password?" }),
    ).not.toBeInTheDocument();
    rerender(<AuthForm {...props} signup={false} email />);
    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    expect(screen.getByLabelText("Your account email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Forgot password?" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});

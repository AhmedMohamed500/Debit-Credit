import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CloudFailure, type CloudIdentity } from "@/lib/cloud/runtime";
import { CloudAccount } from "@/components/cloud/account";
import { ThemeProvider } from "@/components/platform/theme-provider";
import { THEME_KEY } from "@/lib/platform";
import { createExcelProgress } from "@/lib/excel-foundations/engine";

const fixture = vi.hoisted(() => ({
  identity: null as CloudIdentity | null,
  request: vi.fn(),
  verify: vi.fn(),
  signOut: vi.fn(),
  retry: vi.fn(),
  pending: 0,
  syncStatus: "ready",
  path: "/en/account",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => fixture.path,
  useRouter: () => ({ replace: fixture.replace, push: fixture.replace }),
}));
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => fixture.identity,
}));
vi.mock("@/lib/cloud/runtime", () => ({
  requestJSON: (...args: unknown[]) => fixture.request(...args),
  currentSyncStatus: () => fixture.syncStatus,
  pendingBackups: () => fixture.pending,
  retryBackups: () => fixture.retry(),
  CloudFailure: class CloudFailure extends Error {
    constructor(
      public status: number,
      public code: string,
    ) {
      super(code);
    }
  },
}));
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    sendVerificationEmail: (...args: unknown[]) => fixture.verify(...args),
    signOut: () => fixture.signOut(),
  },
}));
vi.mock("@/components/career/profile-photo", () => ({
  ProfilePhoto: ({ name, editable }: { name: string; editable?: boolean }) => (
    <div data-testid="profile-photo" data-editable={String(Boolean(editable))}>
      {name}
    </div>
  ),
}));

function identity(verified = true): CloudIdentity {
  return {
    personalComplete: true,
    user: {
      id: "settings-fixture-owner",
      email: "noura@settings-qa.invalid",
      emailVerified: verified,
      role: "USER",
    },
    profile: {
      userId: "settings-fixture-owner",
      displayName: "Noura Saleh",
      handle: "noura-saleh",
      avatar: "blue",
      locale: "en",
      persona: "student",
      targetRoleId: "junior-accountant",
      updatedAt: "2026-10-15T00:00:00.000Z",
    },
    capabilities: { email: true, google: false },
  };
}
const personal = {
  revision: 3,
  data: {
    details: {
      fullName: "Noura Saleh",
      phone: "+201000000000",
      country: "Egypt",
      location: "Aswan, Egypt",
      institution: "University of Aswan",
      degree: "Bachelor of Commerce",
      field: "Accounting",
      graduationYear: "2027",
      experienceLevel: "student",
      linkedIn: "",
      portfolio: "",
      languages: ["Arabic", "English"],
    },
    email: "noura@settings-qa.invalid",
    savedAt: "2026-10-15T00:00:00.000Z",
  },
};
function view(locale: "ar" | "en" = "en") {
  fixture.path = `/${locale}/account`;
  return render(
    <ThemeProvider>
      <CloudAccount locale={locale} />
    </ThemeProvider>,
  );
}
function editName(value: string) {
  fireEvent.change(screen.getByLabelText(/Display name|الاسم المعروض/), {
    target: { value },
  });
}
function saveButton() {
  return screen.getByRole("button", { name: /Save changes|حفظ التغييرات/ });
}

beforeEach(() => {
  fixture.identity = identity();
  fixture.request.mockReset();
  fixture.request.mockImplementation((route: string) =>
    Promise.resolve(
      route === "me/personal"
        ? personal
        : route === "me/excel-foundations"
          ? { revision: 0, data: createExcelProgress() }
          : identity().profile,
    ),
  );
  fixture.verify.mockReset();
  fixture.verify.mockResolvedValue({ error: null });
  fixture.signOut.mockReset();
  fixture.signOut.mockResolvedValue({ error: null });
  fixture.retry.mockReset();
  fixture.pending = 0;
  fixture.syncStatus = "ready";
  fixture.path = "/en/account";
  fixture.replace.mockReset();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("approved account settings contract", () => {
  it.each([
    ["ar", "إعدادات الحساب", "إدارة بياناتك وأمان حسابك وإعداداتك"],
    ["en", "Account Settings", "Manage your account, security and preferences"],
  ] as const)(
    "renders the %s title, subtitle and real authenticated identity without sample data",
    (locale, title, subtitle) => {
      const { container } = view(locale);
      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeVisible();
      expect(screen.getByText(subtitle)).toBeVisible();
      expect(screen.getAllByText("Noura Saleh").length).toBeGreaterThan(0);
      expect(
        screen.getAllByText("noura@settings-qa.invalid").length,
      ).toBeGreaterThan(0);
      expect(
        screen
          .getAllByTestId("profile-photo")
          .some((photo) => photo.getAttribute("data-editable") === "true"),
      ).toBe(true);
      expect(container).not.toHaveTextContent("ahmed@example.com");
      expect(container).not.toHaveTextContent("حسابي السحابي");
      expect(container.querySelector(".student-journey-bar")).toBeNull();
      expect(container.querySelectorAll(".cloud-account-bar")).toHaveLength(0);
      expect(
        container.querySelectorAll(".account-settings-nav, .platform-nav")
          .length,
      ).toBeLessThanOrEqual(1);
    },
  );

  it("saves supported account fields with the existing revision and only confirms after the server responds", async () => {
    let finish!: (value: CloudIdentity["profile"]) => void;
    fixture.request.mockImplementation((route: string) => {
      if (route === "me/personal") return Promise.resolve(personal);
      if (route === "me/excel-foundations")
        return Promise.resolve({ revision: 0, data: createExcelProgress() });
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    view();
    editName("Noura Saleh Updated");
    fireEvent.change(screen.getByLabelText(/Public handle|المعرّف العام/), {
      target: { value: "noura-updated" },
    });
    const submit = saveButton();
    fireEvent.click(submit);
    await waitFor(() =>
      expect(fixture.request).toHaveBeenCalledWith(
        "me/profile",
        "PUT",
        expect.objectContaining({
          displayName: "Noura Saleh Updated",
          handle: "noura-updated",
          revision: identity().profile.updatedAt,
        }),
      ),
    );
    expect(submit).toBeDisabled();
    expect(
      screen.queryByText(
        /Saved to your account|Changes saved|تم حفظ التغييرات/,
      ),
    ).toBeNull();
    await act(async () =>
      finish({
        ...identity().profile,
        displayName: "Noura Saleh Updated",
        handle: "noura-updated",
        updatedAt: "2026-10-15T00:01:00.000Z",
      }),
    );
    await waitFor(() => expect(submit).toBeEnabled());
    expect(screen.getAllByText("Noura Saleh Updated").length).toBeGreaterThan(
      0,
    );
  });

  it.each([409, 503])(
    "keeps user edits after a failed account save (HTTP %i)",
    async (status) => {
      fixture.request.mockImplementation((route: string) => {
        if (route === "me/personal") return Promise.resolve(personal);
        if (route === "me/excel-foundations")
          return Promise.resolve({ revision: 0, data: createExcelProgress() });
        return Promise.reject(
          new CloudFailure(
            status,
            status === 409 ? "CONFLICT" : "UNAVAILABLE",
          ),
        );
      });
      view();
      editName("Noura Unsent Edit");
      fireEvent.click(saveButton());
      await waitFor(() => expect(saveButton()).toBeEnabled());
      expect(screen.getByLabelText(/Display name|الاسم المعروض/)).toHaveValue(
        "Noura Unsent Edit",
      );
      expect(
        screen.queryByText(
          /Saved to your account|Changes saved|تم حفظ التغييرات/,
        ),
      ).toBeNull();
      expect(
        screen.getByText(
          status === 409
            ? /conflict|changed|taken|تعارض|تغير/i
            : /not saved|could not save|failed|تعذّر|لم يتم الحفظ/i,
        ),
      ).toBeVisible();
    },
  );

  it("does not offer verification for a verified email", () => {
    view();
    expect(
      screen.queryByRole("button", {
        name: /verification|verify|تحقق|التحقق/i,
      }),
    ).toBeNull();
    expect(fixture.verify).not.toHaveBeenCalled();
  });
  it("uses the saved personal location without repeating an already included country", async () => {
    view();
    expect(
      await screen.findByRole("textbox", { name: /Location \(career profile\)|الموقع \(الملف المهني\)/ }),
    ).toHaveValue("Aswan, Egypt");
  });
  it("offers a real email-verification request only for an unverified address", async () => {
    fixture.identity = identity(false);
    view("ar");
    fireEvent.click(
      screen.getByRole("button", { name: /التحقق|تأكيد|verification|verify/i }),
    );
    await waitFor(() =>
      expect(fixture.verify).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "noura@settings-qa.invalid",
          callbackURL: "/ar/account",
        }),
      ),
    );
    expect(fixture.identity?.user.emailVerified).toBe(false);
  });

  it("shows unsynced/conflict states truthfully and retries pending backups", async () => {
    fixture.pending = 1;
    fixture.syncStatus = "unsynced";
    view();
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("app-sync-status", { detail: "unsynced" }),
      );
    });
    expect(
      screen.getByText(/Not synced|Unsynced|لم يتم الحفظ|غير متزامن/i),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: /Sync now|Retry|مزامنة الآن|حاول ثانية/i,
      }),
    );
    expect(fixture.retry).toHaveBeenCalledTimes(1);
    fixture.syncStatus = "conflict";
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("app-sync-status", { detail: "conflict" }),
      );
    });
    expect(screen.getByText("Revision conflict")).toBeVisible();
    expect(screen.getByRole("button", { name: "Sync now" })).toBeDisabled();
  });

  it.each([
    ["ready", "No pending local backups"],
    ["saving", "Saving in progress"],
    ["saved", "Latest operation confirmed"],
  ] as const)("shows the actual %s synchronization state", (status, title) => {
    fixture.syncStatus = status;
    view();
    expect(screen.getByText(title)).toBeVisible();
  });

  it("does not claim all data is saved when an account still has pending drafts", async () => {
    fixture.pending = 1;
    fixture.syncStatus = "saved";
    const { container } = view("ar");
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent("app-sync-status", { detail: "saved" }),
      );
    });
    expect(container).not.toHaveTextContent("تم حفظ جميع البيانات");
    expect(container).not.toHaveTextContent("All data saved");
  });

  it("cancels sign-out without discarding pending local backups", async () => {
    fixture.pending = 1;
    fixture.syncStatus = "unsynced";
    vi.spyOn(window, "confirm").mockReturnValue(false);
    view();
    fireEvent.click(
      screen.getByRole("button", { name: /Sign out|تسجيل الخروج|خروج/i }),
    );
    expect(window.confirm).toHaveBeenCalled();
    expect(fixture.signOut).not.toHaveBeenCalled();
  });

  it.each(["ar", "en"] as const)(
    "uses working localized destinations for every important link (%s)",
    (locale) => {
      view(locale);
      const hrefs = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("a[href]"),
      ).map((link) => link.getAttribute("href"));
      for (const route of [
        "",
        "/career-profile",
        "/career-profile/skills",
        "/career-profile/cv",
        "/career",
      ])
        expect(hrefs).toContain(`/${locale}${route}`);
      expect(hrefs.every((href) => href && !href.includes("#"))).toBe(true);
    },
  );

  it("saves learning-ranking consent without changing accepted Excel progress", async () => {
    const completed = {
      ...createExcelProgress(),
      completedSteps: [1, 2, 3, 4, 5] as const,
      completedAt: "2026-10-22T09:00:00.000Z",
      finalScore: 94,
    };
    fixture.request.mockImplementation(
      (route: string, method?: string, body?: Record<string, unknown>) => {
        if (route === "me/personal") return Promise.resolve(personal);
        if (route === "me/excel-foundations" && method === "POST")
          return Promise.resolve({
            revision: 8,
            data: {
              ...completed,
              publicOptIn: body?.publicOptIn === true,
              nickname: String(body?.nickname ?? ""),
            },
          });
        if (route === "me/excel-foundations")
          return Promise.resolve({ revision: 7, data: completed });
        if (route.startsWith("competition/excel-foundations"))
          return Promise.resolve({ ownRank: 3 });
        return Promise.resolve(identity().profile);
      },
    );
    view();
    expect(await screen.findByText("5/5")).toBeVisible();
    fireEvent.change(
      screen.getByLabelText(/Competition display name|اسم الظهور/),
      { target: { value: "Noura Accounts" } },
    );
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Show my chosen name|أوافق/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Save participation|حفظ المشاركة/ }),
    );
    await waitFor(() =>
      expect(fixture.request).toHaveBeenCalledWith(
        "me/excel-foundations",
        "POST",
        expect.objectContaining({
          revision: 7,
          type: "privacy",
          publicOptIn: true,
          nickname: "Noura Accounts",
        }),
      ),
    );
    expect(await screen.findByText("#3")).toBeVisible();
    expect(screen.getByText("94%")).toBeVisible();
  });

  it("applies the existing dark appearance preference rather than a parallel theme state", async () => {
    view();
    fireEvent.change(
      screen.getByRole("combobox", { name: /Appearance|المظهر/i }),
      {
        target: { value: "dark" },
      },
    );
    await waitFor(() => {
      expect(localStorage.getItem(THEME_KEY)).toBe("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AccountingBootcamp } from "@/components/platform/accounting-bootcamp";
import { BeginnerJournalBuilder } from "@/components/foundations/journal-builder";
import { FoundationMissionGameplay } from "@/components/foundations/mission-gameplay";
import { getBootcampMission } from "@/lib/bootcamp/catalog";
vi.mock("next/navigation", () => ({ usePathname: () => "/en/bootcamp" }));
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Accounting Foundations UI", () => {
  it.each(["en", "ar"] as const)(
    "renders bright 13-node %s world and working mission start",
    (locale) => {
      const { container } = render(<AccountingBootcamp locale={locale} />);
      expect(container.querySelector("main")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      expect(
        screen.getByRole("heading", { name: "Accounting Foundations" }),
      ).toBeInTheDocument();
      expect(
        screen
          .getByRole("navigation", {
            name: locale === "ar" ? "مهام الأساسيات" : "Foundation missions",
          })
          .querySelectorAll("button"),
      ).toHaveLength(13);
      expect(
        screen.getByRole("button", {
          name:
            locale === "ar"
              ? "2. هل دي عملية مالية؟"
              : "2. Is this a transaction?",
        }),
      ).toBeDisabled();
      expect(
        container.querySelector('img[src="/foundations/world-v1.png"]'),
      ).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", {
          name: locale === "ar" ? "لنبدأ" : "Let’s begin",
        }),
      );
      expect(
        screen.getByRole("button", {
          name: locale === "ar" ? "حرّك المال" : "Move the money",
        }),
      ).toBeInTheDocument();
    },
  );
  it("requires observing a transfer, then both affected accounts and awards a single learning reward", () => {
    render(<AccountingBootcamp locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Let’s begin" }));
    expect(
      screen.getByRole("button", { name: "I saw the movement · continue" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move the money" }));
    fireEvent.click(
      screen.getByRole("button", { name: "I saw the movement · continue" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Cash" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Check affected accounts" }),
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Capital" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Check affected accounts" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Collect reward · next mission" }),
    );
    expect(
      screen.getByRole("heading", { name: "Accounting Foundations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2. Is this a transaction?" }),
    ).not.toBeDisabled();
    expect(JSON.parse(localStorage.getItem("debit-credit-player-v1")!).xp).toBe(
      120,
    );
  });
  it("renders five matchable source documents and validates the user selection", () => {
    const mission = getBootcampMission("document-dock")!,
      submit = vi.fn();
    render(
      <FoundationMissionGameplay
        locale="ar"
        mission={mission}
        task={mission.tasks[0]}
        onDraft={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /فاتورة/ }));
    expect(submit).toHaveBeenCalledWith(["invoice"]);
    expect(
      screen.getByRole("button", { name: /أمر شراء/ }),
    ).toBeInTheDocument();
  });
  it("lets users build and edit real entry amounts without prefilled answer sides", () => {
    const submit = vi.fn();
    render(
      <BeginnerJournalBuilder
        locale="en"
        entryId="equipment-cash"
        onDraft={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Account line 1" }), {
      target: { value: "equipment" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Debit line 1" }), {
      target: { value: "20000" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Account line 2" }), {
      target: { value: "cash" },
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Credit line 2" }),
      { target: { value: "20000" } },
    );
    expect(
      screen.getByText("Balanced amounts — now verify the economic meaning."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Check entry" }));
    expect(submit).toHaveBeenCalledWith([
      { account: "equipment", debit: 20000, credit: 0 },
      { account: "cash", debit: 0, credit: 20000 },
    ]);
  });
});

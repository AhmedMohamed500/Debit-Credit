import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AccountingCycleLanding } from "@/components/platform/accounting-cycle-landing";
import { accountingCycleStages, cycleStageFromProgress } from "@/lib/marketing/accounting-cycle";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("approved accounting-cycle showcase", () => {
  it("has twelve unique ordered stages with truthful destinations", () => {
    expect(accountingCycleStages).toHaveLength(12);
    expect(new Set(accountingCycleStages.map(stage => stage.id)).size).toBe(12);
    expect(accountingCycleStages.map(stage => stage.title.ar)).toEqual([
      "تأسيس الشركة", "المستندات الواردة", "تحليل العمليات", "تسجيل القيود",
      "دفتر الأستاذ", "ميزان المراجعة", "التسوية البنكية", "تسويات نهاية الفترة",
      "الميزان المعدل", "القوائم المالية", "إقفال السنة", "جواز المهارات والـCV",
    ]);
    for (const stage of accountingCycleStages) {
      if (stage.availability === "preview") expect(stage.route).toBeUndefined();
      else expect(existsSync(join(process.cwd(), "app", "[locale]", stage.route!.slice(1), "page.tsx"))).toBe(true);
    }
    expect(cycleStageFromProgress(0)).toBe(0);
    expect(cycleStageFromProgress(1)).toBe(11);
    expect(cycleStageFromProgress(.52)).toBe(6);
    expect(cycleStageFromProgress(-20)).toBe(0);
    expect(cycleStageFromProgress(20)).toBe(11);
  });

  it("starts at stage one, synchronizes direct selections and navigation, and keeps locked stages honest", () => {
    vi.stubGlobal("scrollTo", vi.fn());
    const view = render(<AccountingCycleLanding locale="ar" />);
    const section = view.container.querySelector("#accounting-cycle")!;
    expect(section).toHaveAttribute("dir", "rtl");
    expect(section).toHaveAttribute("data-active-stage", "1");
    expect(within(section as HTMLElement).getByRole("heading", { name: "الدورة المحاسبية الكاملة خطوة بخطوة" })).toBeInTheDocument();
    expect(view.container.querySelectorAll(".ac-stage-button")).toHaveLength(12);
    expect(view.container.querySelectorAll(".ac-preview")).toHaveLength(12);
    expect(within(section as HTMLElement).getByRole("link", { name: /جرّب المرحلة الآن/ })).toHaveAttribute("href", `/ar/signup?next=${encodeURIComponent('/ar/academy/account-guide')}`);
    fireEvent.click(within(section as HTMLElement).getByRole("button", { name: "المرحلة 8: تسويات نهاية الفترة" }));
    expect(section).toHaveAttribute("data-active-stage", "8");
    expect(view.container.querySelector(".ac-stage-button.is-active .ac-stage-copy strong")).toHaveTextContent("تسويات نهاية الفترة");
    expect(view.container.querySelector(".ac-preview.is-active strong")).toHaveTextContent("تسويات نهاية الفترة");
    expect(view.container.querySelector(".ac-workspace-heading h3")).toHaveTextContent("تسويات نهاية الفترة");
    expect(view.container.querySelector(".ac-info h3")).toHaveTextContent("تسويات نهاية الفترة");
    expect(screen.queryByRole("link", { name: /جرّب المرحلة الآن|افتح الأداة الآن/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "المرحلة قيد التطوير" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "المرحلة التالية" }));
    expect(section).toHaveAttribute("data-active-stage", "9");
    fireEvent.click(screen.getByRole("button", { name: "المرحلة السابقة" }));
    expect(section).toHaveAttribute("data-active-stage", "8");
    fireEvent.click(screen.getByRole("button", { name: "المرحلة 12: جواز المهارات والـCV" }));
    expect(section).toHaveAttribute("data-active-stage", "12");
    expect(screen.getByRole("link", { name: "افتح الأداة الآن" })).toHaveAttribute("href", `/ar/signup?next=${encodeURIComponent('/ar/career-profile/cv')}`);
  });

  it("advances stage by page scroll on desktop and supports English LTR", async () => {
    vi.stubGlobal("scrollTo", vi.fn());
    const view = render(<AccountingCycleLanding locale="en" />);
    const section = view.container.querySelector("#accounting-cycle") as HTMLElement;
    expect(section).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("heading", { name: "The complete accounting cycle step by step" })).toBeInTheDocument();
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: -2800, bottom: 3200, height: 6000 } as DOMRect);
    fireEvent.scroll(window);
    await waitFor(() => expect(section).toHaveAttribute("data-active-stage", "7"));
    expect(view.container.querySelector(".ac-workspace-heading h3")).toHaveTextContent("Bank Reconciliation");
    expect(screen.getByRole("link", { name: "Try this stage" })).toHaveAttribute("href", `/en/signup?next=${encodeURIComponent('/en/game/bank-reconciliation')}`);
  });
});

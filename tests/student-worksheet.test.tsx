import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StudentWorksheet } from "@/components/student/student-worksheet";
import { calculateSheetCell } from "@/lib/student/worksheet";
import {
  gradeStudent,
  studentLedger,
  stepIds,
  type StudentState,
} from "@/lib/student/unit";
afterEach(cleanup);
const accepted = stepIds.slice(0, 10),
  balances = studentLedger(accepted);
describe("Safe office worksheet calculation", () => {
  it("recalculates linked totals and differences without treating unfinished work as balanced", () => {
    const cells = {
      C2: 84000,
      C3: 20000,
      C4: 15000,
      C5: 5000,
      C6: 3000,
      C10: "",
      D10: 127000,
      C11: "=C10-D10",
    };
    expect(calculateSheetCell(cells, "C11")).toBe("");
    cells.C10 = "=sum($C$2:$C$6)";
    expect(calculateSheetCell(cells, "C10")).toBe(127000);
    expect(calculateSheetCell(cells, "C11")).toBe(0);
    cells.C2 = 83000;
    expect(calculateSheetCell(cells, "C11")).toBe(-1000);
  });
  it("shows errors instead of running code, network calls, unsupported functions or circular references", () => {
    for (const formula of [
      '=WEBSERVICE("https://example.com")',
      "=globalThis.alert(1)",
      "=SUM(A1:A9)",
      "=C10+D10",
      "=$S$U$M($C$2:$C$9)",
    ])
      expect(calculateSheetCell({ C10: formula }, "C10")).toBe("#NAME?");
    expect(calculateSheetCell({ C10: "=SUM(C2:C11)", C2: 2 }, "C10")).toBe(
      "#REF!",
    );
    expect(calculateSheetCell({ C10: "=C10-D10", D10: 127000 }, "C10")).toBe(
      "#CIRC!",
    );
    expect(calculateSheetCell({ C10: "not a formula" }, "C10")).toBe("#VALUE!");
  });
  it("still grades range and debit-minus-credit intent, not a hardcoded zero or reversed check", () => {
    const state: StudentState = {
      version: 1,
      accepted,
      attempts: {},
      completedAt: null,
    };
    const answer = {
      formula: "=SUM($C$2:$C$9)",
      differenceFormula: "=$C$10-$D$10",
    };
    expect(
      gradeStudent(
        state,
        { revision: 0, step: "worksheet", answer },
        "2026-10-10",
      ).correct,
    ).toBe(true);
    for (const wrong of [
      { ...answer, formula: "127000" },
      { ...answer, differenceFormula: "0" },
      { ...answer, differenceFormula: "=D10-C10" },
    ])
      expect(
        gradeStudent(
          state,
          { revision: 0, step: "worksheet", answer: wrong },
          "2026-10-10",
        ).correct,
      ).toBe(false);
  });
});
describe("Worksheet belongs on the game office computer", () => {
  it("opens a workbook with real balances, formula bar and editable cells, preserves unsent work on returning to the desk", () => {
    const submit = vi.fn((event) => event.preventDefault());
    const { container } = render(
      <form onSubmit={submit}>
        <StudentWorksheet locale="ar" balances={balances} busy={false} />
      </form>,
    );
    expect(screen.queryByRole("table")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "افتح كمبيوتر المكتب" }),
    );
    expect(
      screen.getByRole("table", { name: "Trial Balance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "C2: 84,000" }),
    ).toBeInTheDocument();
    const bar = screen.getByRole("textbox", { name: "شريط الصيغ" });
    fireEvent.change(bar, { target: { value: "=SUM(C2:C9)" } });
    expect(
      screen.getByRole("button", { name: "C10 editable: 127,000" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(bar, { key: "Enter" });
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("الخلية المحددة")).toHaveTextContent("C11");
    fireEvent.change(bar, { target: { value: "=C10-D10" } });
    expect(
      screen.getByRole("button", { name: "C11 editable: 0" }),
    ).toBeInTheDocument();
    expect(new FormData(container.querySelector("form")!).get("formula")).toBe(
      "=SUM(C2:C9)",
    );
    fireEvent.click(screen.getByRole("button", { name: "D10: 127,000" }));
    expect(bar).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "ارجع للمكتب" }));
    fireEvent.click(
      screen.getByRole("button", { name: "افتح كمبيوتر المكتب" }),
    );
    expect(
      screen.getByRole("button", { name: "C10 editable: 127,000" }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "سلّم ملف الجداول للمراجعة" }),
    );
    expect(submit).toHaveBeenCalledOnce();
  });
});

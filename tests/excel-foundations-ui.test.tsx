import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CloudIdentity } from "@/lib/cloud/runtime";
import { createExcelProgress } from "@/lib/excel-foundations/engine";
import { ExcelFoundations } from "@/components/foundations/excel-foundations";

const fixture = vi.hoisted(() => ({ identity: null as CloudIdentity | null, push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: fixture.push }) }));
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => fixture.identity,
}));
vi.mock("@/components/career/profile-photo", () => ({
  ProfilePhoto: ({ name }: { name: string }) => <span data-testid="account-photo">{name}</span>,
}));

const identity: CloudIdentity = {
  personalComplete: true,
  user: { id: "account-1", email: "ahmed@example.test", emailVerified: true, role: "USER" },
  profile: {
    userId: "account-1",
    displayName: "Ahmed Mohamed",
    handle: "ahmed",
    avatar: "blue",
    locale: "en",
    persona: "student",
    targetRoleId: "junior-accountant",
    updatedAt: "2026-10-22",
  },
  capabilities: { email: true, google: false },
};

beforeEach(() => {
  fixture.identity = identity;
  fixture.push.mockReset();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: createExcelProgress(), revision: 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Excel Foundations connected workspace", () => {
  it("shows the signed-in profile identity and links it to account settings", async () => {
    render(<ExcelFoundations locale="en" />);
    const account = screen.getByRole("link", { name: "Open Ahmed Mohamed's account" });
    expect(account).toHaveAttribute("href", "/en/account");
    expect(screen.getByTestId("account-photo")).toHaveTextContent("Ahmed Mohamed");
    await waitFor(() => expect(screen.getByText("0/5 stages complete")).toBeVisible());
  });

  it("moves to the next or previous editable amount cell with Enter", () => {
    render(<ExcelFoundations locale="en" />);
    const b2 = screen.getByLabelText("B2");
    const b3 = screen.getByLabelText("B3");
    b2.focus();
    fireEvent.keyDown(b2, { key: "Enter" });
    expect(b3).toHaveFocus();
    fireEvent.keyDown(b3, { key: "Enter", shiftKey: true });
    expect(b2).toHaveFocus();
  });

  it("applies font size, bold, italic and underline to the selected cell", () => {
    render(<ExcelFoundations locale="en" />);
    const b2 = screen.getByLabelText("B2");
    b2.focus();
    fireEvent.change(screen.getByLabelText("Font size"), { target: { value: "18" } });
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    fireEvent.click(screen.getByRole("button", { name: "Underline" }));
    expect(b2).toHaveStyle({ fontSize: "18px", fontWeight: "800", fontStyle: "italic", textDecoration: "underline" });
  });

  it("opens every workbook ribbon and switches between real worksheet views", () => {
    render(<ExcelFoundations locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("button", { name: "Download CSV" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Formulas" }));
    expect(screen.getByRole("button", { name: /Total assets/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Data" }));
    expect(screen.getByRole("button", { name: "Asset" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByRole("button", { name: "Gridlines" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Source data" }));
    expect(screen.getByRole("heading", { name: "Original source data" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Model" }));
    expect(screen.getByRole("heading", { name: "Accounting equation model" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Add sheet" }));
    expect(screen.getByRole("heading", { name: "My notes sheet" })).toBeVisible();
  });

  it("allows future-stage practice while reserving verified submission for the current stage", () => {
    render(<ExcelFoundations locale="en" />);
    const stageFive = document.querySelectorAll<HTMLButtonElement>(".xf-stagebar button")[4];
    fireEvent.click(stageFive);
    expect(screen.getByText("Open practice preview")).toBeVisible();
    expect(screen.getByLabelText("B2")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Check answer" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Return to current stage" }));
    expect(screen.getByRole("heading", { name: "Cells and basics" })).toBeVisible();
  });

  it("searches local stages and routes broader searches to the learning catalog", () => {
    render(<ExcelFoundations locale="en" />);
    const search = screen.getByRole("textbox", { name: "Search lessons and skills" });
    fireEvent.change(search, { target: { value: "Use SUM" } });
    fireEvent.submit(search.closest("form")!);
    expect(screen.getByText("Open practice preview")).toBeVisible();
    fireEvent.change(search, { target: { value: "bank reconciliation" } });
    fireEvent.submit(search.closest("form")!);
    expect(fixture.push).toHaveBeenCalledWith("/en/learn?q=bank%20reconciliation");
  });
});

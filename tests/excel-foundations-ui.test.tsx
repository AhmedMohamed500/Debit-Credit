import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CloudIdentity } from "@/lib/cloud/runtime";
import { createExcelProgress } from "@/lib/excel-foundations/engine";
import { ExcelFoundations } from "@/components/foundations/excel-foundations";

const fixture = vi.hoisted(() => ({ identity: null as CloudIdentity | null }));

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
});

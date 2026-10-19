import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EmployerDiscoveryShowcase } from "@/components/platform/employer-discovery-showcase";

vi.mock("@/components/cloud/auth-cta", () => ({
  AuthCTA: ({ href, children, ...props }: React.ComponentProps<"a">) => <a href={href} {...props}>{children}</a>,
}));

afterEach(cleanup);

describe("EmployerDiscoveryShowcase", () => {
  it("renders one Arabic, consent-aware illustrative section without fake employer claims", () => {
    const { container } = render(<EmployerDiscoveryShowcase locale="ar" />);
    expect(container.querySelectorAll("#employer-discovery")).toHaveLength(1);
    expect(container.querySelector("#employer-discovery")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("heading", { name: /خلّي الشركات تكتشفك/ })).toBeInTheDocument();
    expect(screen.getAllByText("عرض توضيحي ببيانات خيالية").length).toBeGreaterThan(0);
    expect(screen.getByText("الظهور يتطلب موافقة صريحة")).toBeInTheDocument();
    expect(container.querySelectorAll(".ed-source")).toHaveLength(4);
    expect(container.querySelectorAll(".ed-benefit")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /ابدأ رحلتك الآن/ })).toHaveAttribute("href", "/ar/onboarding");
    expect(container.textContent).not.toMatch(/KPMG|Deloitte|PwC|\b\d+%\b/);
  });

  it("shows the English version and switches profile tabs and candidate preview", () => {
    const { container } = render(<EmployerDiscoveryShowcase locale="en" />);
    expect(container.querySelector("#employer-discovery")).toHaveAttribute("dir", "ltr");
    fireEvent.click(screen.getByRole("tab", { name: "Certificates" }));
    expect(screen.getByText(/User-added, not automatically verified/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View profile: Sara — example" }));
    expect(container.querySelector(".ed-preview")?.textContent).toContain("Sara — example");
    fireEvent.click(screen.getByRole("button", { name: "Add to shortlist" }));
    expect(container.querySelector(".ed-preview")?.textContent).toContain("In demo shortlist");
    expect(screen.getByRole("link", { name: /Start your journey/ })).toHaveAttribute("href", "/en/onboarding");
  });

  it("explains consent without sending a real contact request", () => {
    render(<EmployerDiscoveryShowcase locale="en" />);
    fireEvent.click(screen.getByRole("button", { name: /See how discovery works/ }));
    expect(screen.getByText(/an internal contact request is sent only when the candidate consents/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Search illustrative examples..." }), { target: { value: "no-match-query" } });
    expect(screen.getByText("No illustrative examples match this search.")).toBeInTheDocument();
  });
});

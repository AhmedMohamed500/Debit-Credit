import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { StudentUnit } from "@/components/student/student-unit";
import { emptyStudentState, stepIds } from "@/lib/student/unit";
import * as runtime from "@/lib/cloud/runtime";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Student training opens directly in the existing workbench", () => {
  it("renders the saved training desk without a city, journey bar, or modal", async () => {
    vi.spyOn(runtime, "requestJSON").mockResolvedValue({
      data: emptyStudentState(),
      revision: 0,
    });
    const { container } = render(<StudentUnit locale="en" />);
    await screen.findByRole("heading", {
      name: "Unit 1: Source documents to books",
    });
    expect(container.querySelector(".student-city")).toBeNull();
    expect(container.querySelector(".student-journey-bar")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByLabelText("Mizan student accounting workbench"),
    ).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "Source documents" }),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: /Hold duplicate/ })).toBeVisible();
    expect(runtime.requestJSON).toHaveBeenCalledTimes(1);
  });

  it("opens the exact next mission from saved server progress", async () => {
    vi.spyOn(runtime, "requestJSON").mockResolvedValue({
      data: {
        ...emptyStudentState(),
        accepted: stepIds.slice(0, 7),
      },
      revision: 7,
    });
    render(<StudentUnit locale="en" />);
    expect(await screen.findByText("Post the cash ledger")).toBeVisible();
    expect(screen.getByText("7 / 11 accepted tasks")).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to my journey" })).toHaveAttribute(
      "href",
      "/en",
    );
  });

  it("keeps the workbench visible while a retry reloads saved progress", async () => {
    const request = vi
      .spyOn(runtime, "requestJSON")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: emptyStudentState(), revision: 0 });
    const { container } = render(<StudentUnit locale="ar" />);
    await screen.findByRole("alert");
    expect(container.querySelector(".student-workbench")).toBeVisible();
    screen.getByRole("button", { name: "حاول ثانية" }).click();
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByRole("heading", {
        name: "الوحدة الأولى: من المستند إلى الدفاتر",
      }),
    ).toBeVisible();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StudentCity } from "@/components/student/student-city";
import { StudentUnit } from "@/components/student/student-unit";
import { emptyStudentState } from "@/lib/student/unit";
import * as runtime from "@/lib/cloud/runtime";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("Student training inside the existing game", () => {
  it("keeps the mission button disabled while saved progress is loading", () => {
    const open = vi.fn(); render(<StudentCity locale="en" completed={0} inactive={false} ready={false} onOpen={open}/>);
    const button = screen.getByRole("button", { name: /Open next mission/ });
    expect(button).toBeDisabled(); fireEvent.click(button); expect(open).not.toHaveBeenCalled();
  });
  it("uses the city portals and locks later work until the preceding tasks are accepted", () => {
    const open = vi.fn(),
      { container } = render(
        <StudentCity
          locale="ar"
          completed={0}
          inactive={false}
          onOpen={open}
        />,
      );
    expect(container.querySelector(".fsh-artwork")).toBeInTheDocument();
    expect(container.querySelectorAll(".fsh-portal:disabled")).toHaveLength(4);
    expect(
      container.querySelectorAll('.fsh-portal[aria-current="step"]'),
    ).toHaveLength(1);
    fireEvent.click(
      screen.getByRole("button", { name: /افتح المهمة التالية/ }),
    );
    expect(open).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "مركز اللعب" })).toHaveAttribute(
      "href",
      "/ar/game",
    );
  });
  it("opens a source-file workbench from the city and retains an unsent choice on close/reopen", async () => {
    vi.spyOn(runtime, "requestJSON").mockResolvedValue({
      data: emptyStudentState(),
      revision: 0,
    });
    render(<StudentUnit locale="en" />);
    await screen.findByText("Your accounting desk");
    await waitFor(() => expect(screen.getByRole("button", { name: /Open next mission/ })).toBeEnabled());
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Open next mission/ }));
    await screen.findByRole("dialog");
    expect(
      screen.getByRole("navigation", { name: "Source documents" }),
    ).toBeInTheDocument();
    const option = screen.getByRole("radio", { name: /Hold duplicate/ });
    fireEvent.click(option);
    expect(option).toBeChecked();
    fireEvent.click(
      screen.getByRole("button", { name: "Close training desk" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Open next mission/ }));
    expect(screen.getByRole("radio", { name: /Hold duplicate/ })).toBeChecked();
    expect(runtime.requestJSON).toHaveBeenCalledTimes(1);
  });
});

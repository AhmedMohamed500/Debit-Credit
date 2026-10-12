import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { TalentSearch } from "@/components/employer/talent-search";
import type { Candidate } from "@/lib/talent/model";
const fixture = vi.hoisted(() => ({ owner: "recruiter-a", request: vi.fn() }));
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => ({ user: { id: fixture.owner } }),
}));
vi.mock("@/lib/cloud/runtime", () => ({
  cloudUser: () => fixture.owner,
  requestJSON: (...args: unknown[]) => fixture.request(...args),
}));
const candidate = (name: string, id: string, photo: string): Candidate => ({
  id,
  name,
  photo,
  currentRole: "Junior Accountant",
  workType: "flexible",
  graduationYear: "2026",
  role: "junior-accountant",
  level: "junior",
  location: "Alexandria, Egypt",
  availability: "internship",
  summary: "Practical accounting trainee. Simulation, not employment.",
  education: [],
  languages: ["English"],
  skills: [],
  works: [],
  socials: {},
  courses: [],
  certificates: [],
  cv: false,
  contactRequests: false,
});
const a = candidate(
  "Ahmed Mohamed Test",
  "a",
  "data:image/webp;base64,photo-a",
);
const b = candidate("Salma Candidate B", "b", "data:image/webp;base64,photo-b");
afterEach(cleanup);
beforeEach(() => {
  fixture.owner = "recruiter-a";
  fixture.request.mockReset();
  fixture.request.mockImplementation(async (route: string) =>
    route === "employer/account"
      ? {
          company: {
            id: "workspace-a",
            name: "Fixture Company",
            recruiter: "Fixture Recruiter",
            permission: "OWNER",
          },
        }
      : route === "employer/shortlist"
        ? { items: [] }
        : route === "employer/candidates/a"
          ? a
          : route === "employer/candidates/b"
            ? b
            : { items: [a, b], page: 1, pageSize: 20, total: 2 },
  );
});
it("uses real returned count, compact reference structure and disabled jobs/analytics", async () => {
  const { container } = render(<TalentSearch locale="en" />);
  expect(
    await screen.findByRole("heading", { name: "Candidates (2)" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Jobs" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Analytics" })).toBeDisabled();
  expect(
    container.querySelector(".talent-search-line select"),
  ).toBeInTheDocument();
  expect(
    container.querySelector(".talent-hero .talent-filters"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Candidates (124)")).toBeNull();
  fireEvent.change(screen.getByRole("textbox", { name: "Search candidates" }), {
    target: { value: " Ahmed Mohamed " },
  });
  fireEvent.submit(container.querySelector("form")!);
  await waitFor(() =>
    expect(fixture.request).toHaveBeenCalledWith(
      "employer/candidates?page=1&q=+Ahmed+Mohamed+",
    ),
  );
});
it("switches selected candidate portrait and preserves exact preview hierarchy/privacy", async () => {
  const { container } = render(<TalentSearch locale="en" />);
  await screen.findByRole("heading", { name: "Candidates (2)" });
  fireEvent.click(container.querySelectorAll(".candidate-result-open")[0]);
  await waitFor(() =>
    expect(container.querySelector(".preview-heading img")).toHaveAttribute(
      "src",
      a.photo,
    ),
  );
  expect(
    Array.from(container.querySelectorAll(".preview-tabs button")).map(
      (el) => el.textContent,
    ),
  ).toEqual(["Profile", "Skills", "Projects", "Certificates", "CV"]);
  for (const heading of [
    "About",
    "Key Information",
    "Top Skills",
    "Highlighted Project (Simulation)",
    "Certificates · self-reported",
  ])
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Download CV" })).toBeNull();
  expect(container.querySelector(".preview-footer a")).toHaveAttribute(
    "href",
    "/en/employer/candidates/a",
  );
  fireEvent.click(container.querySelectorAll(".candidate-result-open")[1]);
  await waitFor(() =>
    expect(container.querySelector(".preview-heading img")).toHaveAttribute(
      "src",
      b.photo,
    ),
  );
  expect(container.querySelector(".talent-preview")).not.toHaveTextContent(
    a.name,
  );
});
it("clears previous recruiter results when another account context is restoring", async () => {
  const { container, rerender } = render(<TalentSearch locale="ar" />);
  await screen.findByRole("heading", { name: "المرشحون (2)" });
  fixture.owner = "recruiter-b";
  fixture.request.mockImplementation(() => new Promise(() => {}));
  rerender(<TalentSearch locale="ar" />);
  expect(container.querySelector(".talent-result")).toBeNull();
  expect(container.querySelector(".talent-preview")).toBeNull();
});

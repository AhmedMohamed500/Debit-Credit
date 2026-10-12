import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  ProfessionalCard,
  profileCardImage,
} from "@/components/career/professional-card";
import { CareerPass } from "@/components/career/candidate-portfolio";
import { defaultShowcase, type Showcase } from "@/lib/career/showcase";
const fixture = vi.hoisted(() => ({ owner: "candidate-a", request: vi.fn() }));
vi.mock("@/lib/cloud/runtime", () => ({
  cloudUser: () => fixture.owner,
  requestJSON: (...args: unknown[]) => fixture.request(...args),
}));
const data: Showcase = {
  revision: 1,
  token: null,
  name: "Ahmed Mohamed Ahmed Abdallah",
  works: [],
  settings: {
    ...defaultShowcase(),
    socials: {
      ...defaultShowcase().socials,
      linkedin: "https://www.linkedin.com/in/real-fixture",
    },
  },
};
const profile = {
  headline: "Junior Accountant",
  location: "Alexandria",
  country: "Egypt",
};
afterEach(cleanup);
beforeEach(() => {
  fixture.owner = "candidate-a";
  fixture.request.mockReset();
  fixture.request.mockResolvedValue({
    data: { image: "data:image/webp;base64,fixture-a" },
  });
});
it("share OFF retains brand, photo, name, current/target role, location, links and QR cell, with disabled download", async () => {
  const open = vi.fn();
  const { container } = render(
    <ProfessionalCard
      owner={fixture.owner}
      data={data}
      role="junior-accountant"
      locale="ar"
      url=""
      qr=""
      profile={profile}
      onSharing={open}
    />,
  );
  await waitFor(() =>
    expect(
      container.querySelector(".profile-card-portrait img"),
    ).toBeInTheDocument(),
  );
  expect(container.querySelector(".profile-share-card")).toHaveAttribute(
    "data-share-enabled",
    "false",
  );
  for (const value of [
    data.name,
    "Junior Accountant",
    "Alexandria, Egypt",
    "LinkedIn",
    "المشاركة غير مفعلة",
  ])
    expect(container).toHaveTextContent(value);
  expect(container.querySelector(".profile-card-body img")).toBeNull();
  expect(
    screen.getByRole("button", { name: "تنزيل كارت البروفايل" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "تفعيل المشاركة" }),
  );
  expect(open).toHaveBeenCalledOnce();
  expect(
    fixture.request.mock.calls.every(
      (args) => args[0] === "me/photo" && args.length === 1,
    ),
  ).toBe(true);
});
it("share ON shows only the actual QR and selected public link while card-only photo switch does not publish anything", async () => {
  const active = { ...data, token: "a".repeat(32) };
  const url = "https://fixture.test/ar/portfolio/" + active.token;
  const qr = "data:image/png;base64,real-local-fixture";
  const { container } = render(
    <ProfessionalCard
      owner={fixture.owner}
      data={active}
      role="junior-accountant"
      locale="en"
      url={url}
      qr={qr}
      profile={profile}
      onSharing={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Download profile card",
      }),
    ).toBeEnabled(),
  );
  expect(container.querySelector(".profile-card-body img")).toHaveAttribute(
    "src",
    qr,
  );
  expect(container.querySelector(".profile-card-body a")).toHaveAttribute(
    "href",
    url,
  );
  fireEvent.click(screen.getByRole("switch"));
  expect(container.querySelector(".profile-card-portrait img")).toBeNull();
  expect(container.querySelector(".profile-card-body img")).toHaveAttribute(
    "src",
    qr,
  );
  expect(
    fixture.request.mock.calls.every(
      (args) => args[0] === "me/photo" && args.length === 1,
    ),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  expect(screen.getByRole("dialog")).toHaveTextContent(data.name);
  fireEvent.click(
    screen.getByRole("button", { name: "Close preview" }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("hero Career ID keeps its same shell when QR is off instead of a shield warning", () => {
  const { container } = render(
    <CareerPass data={data} locale="ar" open={vi.fn()} />,
  );
  expect(container.querySelector(".career-pass")).toHaveTextContent(
    "المعرّف المهني",
  );
  expect(container.querySelector(".career-pass-qr")).toHaveTextContent(
    "المشاركة غير مفعلة",
  );
  expect(container.querySelector(".career-pass svg")).toBeNull();
  expect(container.querySelector(".career-pass img")).toBeNull();
});
it("PNG generation refuses a missing or unrelated share token before creating an image", async () => {
  await expect(
    profileCardImage(data, "junior-accountant", "", null),
  ).rejects.toThrow("REAL_SHARE_LINK_REQUIRED");
  await expect(
    profileCardImage(
      { ...data, token: "a".repeat(32) },
      "junior-accountant",
      "https://fixture.test/ar/portfolio/other",
      null,
    ),
  ).rejects.toThrow("REAL_SHARE_LINK_REQUIRED");
});

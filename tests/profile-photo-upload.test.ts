import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/components/cloud/session-boundary", () => ({
  useCloudIdentity: () => null,
}));
vi.mock("@/lib/cloud/runtime", () => ({
  requestJSON: vi.fn(),
  CloudFailure: class extends Error {
    status = 400;
  },
}));
import { prepareProfilePhoto } from "@/components/career/profile-photo";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("retains uploaded PNG alpha instead of painting white or exporting JPEG", async () => {
  const bitmap = { width: 512, height: 512, close: vi.fn() };
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
  const context = { drawImage: vi.fn(), fillRect: vi.fn(), fillStyle: "" };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue(context),
    toDataURL: vi.fn().mockReturnValue("data:image/webp;base64,AAAA"),
  };
  vi.spyOn(document, "createElement").mockReturnValue(
    canvas as unknown as HTMLCanvasElement,
  );
  const result = await prepareProfilePhoto(
    new File(["test"], "cutout.png", { type: "image/png" }),
  );
  expect(context.fillRect).not.toHaveBeenCalled();
  expect(canvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.82);
  expect(context.drawImage).toHaveBeenCalled();
  expect(bitmap.close).toHaveBeenCalled();
  expect(result).toMatch(/^data:image\/webp/);
});

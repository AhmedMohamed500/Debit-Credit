import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { photoCommand } from "@/lib/career/photo";
vi.mock("server-only", () => ({}));
import { sanitizePhoto } from "@/lib/server/profiles/photo";

describe("Private profile photo validation", () => {
  it("accepts a revision-controlled image or removal, never an owner or arbitrary URL", () => {
    expect(
      photoCommand.safeParse({
        revision: 0,
        image: "data:image/png;base64,AAAA",
      }).success,
    ).toBe(true);
    expect(photoCommand.safeParse({ revision: 1, image: null }).success).toBe(
      true,
    );
    for (const image of [
      "https://remote.example/photo.jpg",
      "data:image/svg+xml;base64,AAAA",
      "data:image/gif;base64,AAAA",
      "data:image/png;base64," + "A".repeat(220_000),
    ])
      expect(photoCommand.safeParse({ revision: 0, image }).success).toBe(
        false,
      );
    expect(
      photoCommand.safeParse({
        revision: 0,
        image: null,
        userId: "another-user",
      }).success,
    ).toBe(false);
  });
  it("decodes real pixels, crops square, re-encodes WebP and strips metadata", async () => {
    const original = await sharp({
      create: { width: 900, height: 600, channels: 3, background: "#4caaf8" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await sanitizePhoto(
      "data:image/jpeg;base64," + original.toString("base64"),
    );
    const bytes = Buffer.from(result.split(",")[1], "base64"),
      meta = await sharp(bytes).metadata();
    expect(result).toMatch(/^data:image\/webp;base64,/);
    expect([meta.width, meta.height]).toEqual([512, 512]);
    expect(meta.exif).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
    expect(bytes.length).toBeLessThan(120_000);
  });
  it("rejects corrupt, vector, pixel-bomb and oversized originals", async () => {
    await expect(
      sanitizePhoto("data:image/png;base64,AAAA"),
    ).rejects.toMatchObject({ status: 400, code: "INVALID_PHOTO" });
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32"/></svg>',
    );
    await expect(
      sanitizePhoto("data:image/png;base64," + svg.toString("base64")),
    ).rejects.toMatchObject({ status: 400 });
    const large = await sharp({
      create: { width: 2500, height: 2500, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(
      sanitizePhoto("data:image/png;base64," + large.toString("base64")),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      sanitizePhoto(
        "data:image/png;base64," + Buffer.alloc(170_000).toString("base64"),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("preserves transparent cutout pixels without adding a white background", async () => {
    const original = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 100,
              height: 100,
              channels: 4,
              background: { r: 30, g: 60, b: 90, alpha: 1 },
            },
          })
            .png()
            .toBuffer(),
          left: 206,
          top: 206,
        },
      ])
      .png()
      .toBuffer();
    const result = await sanitizePhoto(
      "data:image/png;base64," + original.toString("base64"),
    );
    const output = sharp(Buffer.from(result.split(",")[1], "base64"));
    expect((await output.metadata()).hasAlpha).toBe(true);
    const { data, info } = await output
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(data[3]).toBe(0);
    expect(data[(256 * info.width + 256) * info.channels + 3]).toBe(255);
  });
});

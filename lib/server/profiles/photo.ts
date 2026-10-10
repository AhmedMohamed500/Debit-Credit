import "server-only";
import sharp from "sharp";
import type { z } from "zod";
import {
  photoCommand,
  PROFILE_PHOTO_SIZE,
  type ProfilePhoto,
} from "@/lib/career/photo";
import { db, serial, json } from "../db/client";
import { HttpError } from "../security/http";

export const PHOTO_DOMAIN = "profile-photo";
export async function photoFor(userId: string): Promise<ProfilePhoto> {
  const row = await db().cloudProgress.findUnique({
    where: { userId_domain: { userId, domain: PHOTO_DOMAIN } },
  });
  const data = row?.data as ProfilePhoto["data"];
  return { revision: row?.revision ?? 0, data: data?.image ? data : null };
}
export async function sanitizePhoto(image: string) {
  try {
    const source = Buffer.from(image.slice(image.indexOf(",") + 1), "base64");
    if (source.length > 165_000) throw new Error("OVERSIZE");
    const input = sharp(source, {
      limitInputPixels: 4_000_000,
      failOn: "warning",
    });
    const meta = await input.metadata();
    if (
      !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) !== 1 ||
      !meta.width ||
      !meta.height
    )
      throw new Error("INVALID_IMAGE");
    // Re-encoding strips EXIF/GPS and disallows SVG/animation. Never persist originals.
    const output = await input
      .rotate()
      .resize(PROFILE_PHOTO_SIZE, PROFILE_PHOTO_SIZE, { fit: "cover" })
      .webp({ quality: 78 })
      .toBuffer();
    if (output.length > 120_000) throw new Error("OVERSIZE");
    return `data:image/webp;base64,${output.toString("base64")}`;
  } catch {
    throw new HttpError(400, "INVALID_PHOTO");
  }
}
export async function savePhoto(
  userId: string,
  input: z.infer<typeof photoCommand>,
) {
  const data =
    input.image === null
      ? null
      : {
          image: await sanitizePhoto(input.image),
          width: PROFILE_PHOTO_SIZE,
          height: PROFILE_PHOTO_SIZE,
          savedAt: new Date().toISOString(),
        };
  return serial(async (tx) => {
    const where = { userId_domain: { userId, domain: PHOTO_DOMAIN } };
    const current = await tx.cloudProgress.findUnique({ where });
    if ((current?.revision ?? 0) !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    // Store JSON null as an ordinary object so deletion retains the revision guard.
    const row = await tx.cloudProgress.upsert({
      where,
      create: {
        userId,
        domain: PHOTO_DOMAIN,
        data: json(data ?? {}),
        revision: 1,
        provenance: "SERVER",
      },
      update: {
        data: json(data ?? {}),
        revision: { increment: 1 },
        provenance: "SERVER",
      },
    });
    return { revision: row.revision, data };
  });
}

import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { db, json, serial } from "../db/client";
import { HttpError } from "../security/http";
import {
  emptyPortfolio,
  PORTFOLIO_LIMIT,
  type Portfolio,
  type PortfolioCommand,
} from "@/lib/career/portfolio";

export const PORTFOLIO_DOMAIN = "private-portfolio";
export const CERTIFICATE_PREFIX = "private-certificate/";
function snapshot(row: { revision: number; data: unknown } | null): Portfolio {
  if (!row) return { ...emptyPortfolio };
  const data = row.data as Omit<Portfolio, "revision">;
  return {
    revision: row.revision,
    courses: data.courses ?? [],
    certificates: data.certificates ?? [],
  };
}
export async function portfolioFor(userId: string) {
  return snapshot(
    await db().cloudProgress.findUnique({
      where: { userId_domain: { userId, domain: PORTFOLIO_DOMAIN } },
    }),
  );
}
export async function sanitizeCertificate(image: string) {
  try {
    const source = Buffer.from(image.slice(image.indexOf(",") + 1), "base64");
    if (source.length > 675_000) throw new Error("OVERSIZE");
    const input = sharp(source, {
      limitInputPixels: 8_000_000,
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
    // Preserve the entire certificate, never square-crop a document. Re-encoding
    // removes EXIF/GPS and prevents stored SVG, animations and remote URLs.
    const { data, info } = await input
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "white" })
      .webp({ quality: 88 })
      .toBuffer({ resolveWithObject: true });
    if (data.length > 650_000) throw new Error("OVERSIZE");
    return {
      image: `data:image/webp;base64,${data.toString("base64")}`,
      width: info.width,
      height: info.height,
    };
  } catch {
    throw new HttpError(400, "INVALID_CERTIFICATE_IMAGE");
  }
}
export async function certificateFor(userId: string, id: string) {
  const row = await db().cloudProgress.findUnique({
    where: { userId_domain: { userId, domain: CERTIFICATE_PREFIX + id } },
  });
  if (!row) throw new HttpError(404, "NOT_FOUND");
  return row.data;
}
export async function savePortfolio(
  userId: string,
  input: PortfolioCommand,
): Promise<Portfolio> {
  const prepared =
    input.action === "add-certificate"
      ? await sanitizeCertificate(input.image)
      : null;
  return serial(async (tx) => {
    const where = { userId_domain: { userId, domain: PORTFOLIO_DOMAIN } };
    const current = snapshot(await tx.cloudProgress.findUnique({ where }));
    if (current.revision !== input.revision)
      throw new HttpError(409, "REVISION_CONFLICT");
    const now = new Date().toISOString();
    if (input.action === "save-course") {
      if (input.id && !current.courses.some((row) => row.id === input.id))
        throw new HttpError(404, "NOT_FOUND");
      if (!input.id && current.courses.length >= PORTFOLIO_LIMIT)
        throw new HttpError(400, "PORTFOLIO_LIMIT");
      const course = {
        ...input.course,
        id: input.id ?? randomUUID(),
        updatedAt: now,
      };
      current.courses = [
        ...current.courses.filter((row) => row.id !== course.id),
        course,
      ];
    } else if (input.action === "remove-course") {
      if (!current.courses.some((row) => row.id === input.id))
        throw new HttpError(404, "NOT_FOUND");
      current.courses = current.courses.filter((row) => row.id !== input.id);
    } else if (input.action === "add-certificate" && prepared) {
      if (current.certificates.length >= PORTFOLIO_LIMIT)
        throw new HttpError(400, "PORTFOLIO_LIMIT");
      const id = randomUUID();
      await tx.cloudProgress.create({
        data: {
          userId,
          domain: CERTIFICATE_PREFIX + id,
          data: json(prepared),
          revision: 1,
          provenance: "SERVER",
        },
      });
      current.certificates.push({
        ...input.certificate,
        id,
        width: prepared.width,
        height: prepared.height,
        updatedAt: now,
      });
    } else if (input.action === "remove-certificate") {
      if (!current.certificates.some((row) => row.id === input.id))
        throw new HttpError(404, "NOT_FOUND");
      current.certificates = current.certificates.filter(
        (row) => row.id !== input.id,
      );
      await tx.cloudProgress.deleteMany({
        where: { userId, domain: CERTIFICATE_PREFIX + input.id },
      });
    }
    const data = {
      courses: current.courses,
      certificates: current.certificates,
    };
    const row = await tx.cloudProgress.upsert({
      where,
      create: {
        userId,
        domain: PORTFOLIO_DOMAIN,
        data: json(data),
        revision: 1,
        provenance: "SERVER",
      },
      update: {
        data: json(data),
        revision: { increment: 1 },
        provenance: "SERVER",
      },
    });
    return { ...data, revision: row.revision };
  });
}

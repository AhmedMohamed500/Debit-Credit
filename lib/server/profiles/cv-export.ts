import "server-only";
import PDFDocument from "pdfkit";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { CvBlock } from "@/lib/career/compact-cv";
import type { ReturnTypeOfAccountCv } from "./cv-types";

export type CvExportFormat = "pdf" | "docx" | "txt";
export type CvExportFile = {
  bytes: Buffer;
  filename: string;
  contentType: string;
};

const hasArabic = (value: string) => /[\u0600-\u06ff]/u.test(value);
const safeFilename = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
    .toLowerCase() || "accounting-cv";

/**
 * Export exactly the curated, saved-account projection. A missing English
 * identity is an edit prompt, not a reason to invent a name or translation.
 */
export function validateCvExport(data: ReturnTypeOfAccountCv) {
  if (!data.profile.fullName.trim() || !data.profile.email.trim())
    return "CV_CONTACT_INCOMPLETE" as const;
  if (hasArabic(data.profile.fullName) || hasArabic(data.compact.plainText) || data.compact.needsEnglish)
    return "CV_NEEDS_ENGLISH" as const;
  return null;
}

function cleanLine(value: string) {
  // Paragraph boundaries are controlled by the template, not user input.
  return value
    .replace(/[\p{Cc}\p{Cf}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function textOf(blocks: CvBlock[]) {
  return blocks
    .map((block) =>
      [
        ...(block.heading ? [block.heading.toUpperCase()] : []),
        ...block.lines.map(cleanLine).filter(Boolean),
      ].join("\n"),
    )
    .filter(Boolean)
    .join("\n\n");
}

export async function pdfCv(blocks: CvBlock[]): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 48, bottom: 48, left: 50, right: 50 },
    // Keep text streams uncompressed for broad parser interoperability and
    // easy independent audit of the generated, selectable content.
    compress: false,
    info: {
      Title: "Accounting CV",
      Subject: "Professional CV",
      Creator: "Debit & Credit",
    },
  });
  const chunks: Buffer[] = [];
  const complete = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const width = doc.page.width - 100;
  for (const block of blocks) {
    if (block.header) {
      doc.font("Helvetica-Bold").fontSize(16).text(cleanLine(block.lines[0] ?? ""), {
        width,
      });
      for (const line of block.lines.slice(1)) {
        if (cleanLine(line))
          doc.font("Helvetica").fontSize(9.5).text(cleanLine(line), { width });
      }
      doc.moveDown(0.55);
      continue;
    }
    if (block.heading)
      doc.font("Helvetica-Bold").fontSize(10.5).text(block.heading.toUpperCase(), {
        width,
      });
    for (const line of block.lines) {
      const value = cleanLine(line);
      if (value)
        doc.font("Helvetica").fontSize(9.5).text(value, {
          width,
          lineGap: 1.5,
        });
    }
    doc.moveDown(0.4);
  }
  doc.end();
  return complete;
}

export async function wordCv(blocks: CvBlock[]): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];
  for (const block of blocks) {
    if (block.header) {
      const [name, ...contact] = block.lines;
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: cleanLine(name ?? ""), bold: true, size: 32 })],
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 },
          keepNext: true,
        }),
      );
      for (const line of contact) {
        const value = cleanLine(line);
        if (value)
          paragraphs.push(
            new Paragraph({
              text: value,
              spacing: { after: 35 },
              keepNext: true,
            }),
          );
      }
      continue;
    }
    if (block.heading)
      paragraphs.push(
        new Paragraph({
          text: block.heading.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 170, after: 70 },
          keepNext: true,
        }),
      );
    for (const line of block.lines) {
      const value = cleanLine(line);
      if (value)
        paragraphs.push(
          new Paragraph({
            text: value,
            spacing: { after: 65, line: 240 },
            keepLines: true,
          }),
        );
    }
  }
  const document = new Document({
    creator: "Debit & Credit",
    title: "Accounting CV",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 20, color: "000000" },
          paragraph: { spacing: { after: 65, line: 240 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Arial", size: 21, bold: true, color: "000000" },
          paragraph: { spacing: { before: 170, after: 70 }, keepNext: true },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 900, right: 940, bottom: 900, left: 940 },
          },
        },
        children: paragraphs,
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(document));
}

export async function exportAccountCv(
  data: ReturnTypeOfAccountCv,
  format: CvExportFormat,
): Promise<CvExportFile> {
  const blocks = data.compact.blocks;
  const filename = safeFilename(data.profile.fullName) + "-accounting-cv." + format;
  if (format === "pdf")
    return {
      bytes: await pdfCv(blocks),
      filename,
      contentType: "application/pdf",
    };
  if (format === "docx")
    return {
      bytes: await wordCv(blocks),
      filename,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  return {
    bytes: Buffer.from(textOf(blocks), "utf8"),
    filename,
    contentType: "text/plain; charset=utf-8",
  };
}

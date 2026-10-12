"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CvBlockView } from "./compact-cv-view";
import { paginateCv, type CvBlock } from "@/lib/career/compact-cv";
import "@/app/career-profile-documents.css";

// Recruiter exports use the same typesetting and two-page paginator as the owner's CV.
// The input is only the server's consent-filtered blocks, never the private profile.
export function SharedCvView({ blocks }: { blocks: CvBlock[] }) {
  const measure = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    pages: CvBlock[][];
    omitted: number;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    setLayout(null);
    void document.fonts.ready.then(() => {
      if (!alive || !measure.current) return;
      setLayout(
        paginateCv(
          blocks,
          Array.from(measure.current.children).map(
            (el) => el.getBoundingClientRect().height,
          ),
          (265 * 96) / 25.4,
        ),
      );
    });
    return () => {
      alive = false;
    };
  }, [blocks]);
  const documentView = layout && (
    <article
      className="professional-cv cv-typeset"
      lang="en"
      dir="ltr"
      data-pages={layout.pages.length}
    >
      {layout.pages.map((page, index) => (
        <div className="cv-page" key={index}>
          {page.map((block) => (
            <CvBlockView key={block.id} block={block} />
          ))}
          <footer>
            Page {index + 1} of {layout.pages.length}
          </footer>
        </div>
      ))}
    </article>
  );
  return (
    <>
      <button
        className="talent-primary"
        disabled={!layout?.pages.length}
        onClick={() => window.print()}
      >
        Print / Save PDF · English · ≤2 A4 pages
      </button>
      {layout && (
        <p>
          {layout.pages.length}/2 pages
          {layout.omitted > 0
            ? " · concise selection; remaining records stay on profile"
            : ""}
        </p>
      )}
      <div className="shared-cv-screen compact-cv-shell">
        <div ref={measure} className="cv-measure cv-typeset" aria-hidden="true">
          {blocks.map((block) => (
            <CvBlockView key={block.id} block={block} />
          ))}
        </div>
        {documentView}
      </div>
      {layout &&
        createPortal(
          <div className="shared-cv-print compact-cv-shell">
            {documentView}
          </div>,
          document.body,
        )}
    </>
  );
}

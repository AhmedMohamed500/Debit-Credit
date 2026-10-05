"use client";
import Image from "next/image";
import {
  Banknote,
  Building2,
  Package,
  Monitor,
  Users,
  Truck,
  BarChart3,
  Receipt,
  FileText,
  Landmark,
  Coins,
  ArrowLeftRight,
} from "lucide-react";
import type { Locale } from "@/types";
export const formatMoney = (value: number) => value.toLocaleString("en-US");
export function FoundationIcon({ kind }: { kind?: string }) {
  const Icon =
    kind === "cash"
      ? Banknote
      : kind === "box"
        ? Package
        : kind === "equipment"
          ? Monitor
          : kind === "customer"
            ? Users
            : kind === "supplier"
              ? Truck
              : kind === "capital" || kind === "revenue"
                ? BarChart3
                : kind === "invoice" || kind === "po"
                  ? FileText
                  : kind === "receipt" || kind === "voucher" || kind === "rent"
                    ? Receipt
                    : kind === "bank"
                      ? Landmark
                      : Coins;
  return <Icon aria-hidden="true" />;
}
export function GuideCharacter({
  locale,
  dialogue,
}: {
  locale: Locale;
  dialogue: string;
}) {
  return (
    <aside className="fdn-guide">
      <Image
        src="/foundations/guide-v1.png"
        alt={
          locale === "ar"
            ? "أحمد، مرشد رحلة الأساسيات"
            : "Ahmed, your foundations guide"
        }
        width={380}
        height={340}
        priority
        unoptimized
      />
      <div className="fdn-speech">
        <small>
          {locale === "ar"
            ? "أحمد · معك خطوة بخطوة"
            : "AHMED · ONE STEP AT A TIME"}
        </small>
        <p>{dialogue}</p>
      </div>
    </aside>
  );
}
export function MoneyFlow({
  locale,
  investment,
  moved,
  onMove,
}: {
  locale: Locale;
  investment: boolean;
  moved: boolean;
  onMove?: () => void;
}) {
  const ar = locale === "ar";
  return (
    <div className={`fdn-money-flow ${moved ? "moved" : ""}`}>
      <div className="fdn-money-end">
        <FoundationIcon kind="cash" />
        <b>
          {investment
            ? ar
              ? "أموال أحمد الخاصة"
              : "Ahmed’s own money"
            : ar
              ? "النقدية"
              : "Cash"}
        </b>
        <span>{formatMoney(investment ? 100000 : 20000)} EGP</span>
      </div>
      <button
        className="fdn-money-token"
        type="button"
        draggable={!moved}
        onDragStart={(e) =>
          e.dataTransfer.setData("text/plain", "foundation-money")
        }
        onClick={onMove}
        disabled={moved}
        aria-label={ar ? "حرّك المال" : "Move the money"}
      >
        <Coins />
        <span>{moved ? "✓" : ar ? "انقل المال" : "Move money"}</span>
        <ArrowLeftRight />
      </button>
      <div
        className="fdn-money-end fdn-company"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.getData("text/plain") === "foundation-money")
            onMove?.();
        }}
      >
        {investment ? (
          <Building2 aria-hidden="true" />
        ) : (
          <FoundationIcon kind="equipment" />
        )}
        <b>{investment ? "Mizan Trading" : ar ? "المعدات" : "Equipment"}</b>
        <span>
          {moved ? `${formatMoney(investment ? 100000 : 20000)} EGP` : "—"}
        </span>
      </div>
    </div>
  );
}

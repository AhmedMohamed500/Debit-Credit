"use client";

import { useState, type FormEvent } from "react";
import { MessageSquareText } from "lucide-react";
import { requestJSON } from "@/lib/cloud/runtime";
import type { Locale } from "@/types";

export function StudentBetaFeedback({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [rating, setRating] = useState("5");
  const [topic, setTopic] = useState("clarity");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    try {
      await requestJSON("me/beta-feedback", "POST", {
        rating: Number(rating),
        topic,
        comment,
      });
      setComment("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <details className="journey-beta-feedback">
      <summary>
        <MessageSquareText />
        {ar ? "ساعدنا نحسّن النسخة التجريبية" : "Help improve the beta"}
      </summary>
      <form onSubmit={submit}>
        <label>
          {ar ? "تقييم التجربة" : "Experience rating"}
          <select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="5">5 — {ar ? "ممتازة" : "Excellent"}</option>
            <option value="4">4 — {ar ? "جيدة" : "Good"}</option>
            <option value="3">3 — {ar ? "مقبولة" : "Okay"}</option>
            <option value="2">2 — {ar ? "مربكة" : "Confusing"}</option>
            <option value="1">1 — {ar ? "تحتاج إصلاحًا" : "Needs work"}</option>
          </select>
        </label>
        <label>
          {ar ? "الموضوع" : "Topic"}
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="clarity">{ar ? "وضوح الشرح" : "Explanation clarity"}</option>
            <option value="navigation">{ar ? "التنقل" : "Navigation"}</option>
            <option value="technical">{ar ? "مشكلة تقنية" : "Technical issue"}</option>
            <option value="other">{ar ? "شيء آخر" : "Other"}</option>
          </select>
        </label>
        <label>
          {ar ? "ملاحظة اختيارية" : "Optional note"}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={
              ar
                ? "ما الذي ساعدك أو عطّلك؟"
                : "What helped or blocked you?"
            }
          />
        </label>
        <small>
          {ar
            ? "لا تكتب اسمك أو رقم هاتفك أو أي بيانات شخصية. نحفظ أحدث رد فقط."
            : "Do not include your name, phone number, or personal data. Only your latest response is kept."}
        </small>
        <button type="submit" disabled={status === "saving"}>
          {status === "saving"
            ? ar
              ? "جارٍ الإرسال…"
              : "Sending…"
            : ar
              ? "إرسال الملاحظة"
              : "Send feedback"}
        </button>
        {status === "saved" && (
          <p role="status">
            {ar ? "شكرًا — تم حفظ ملاحظتك." : "Thank you — feedback saved."}
          </p>
        )}
        {status === "error" && (
          <p role="alert">
            {ar
              ? "تعذّر الحفظ الآن. حاول مرة أخرى."
              : "Could not save right now. Please retry."}
          </p>
        )}
      </form>
    </details>
  );
}

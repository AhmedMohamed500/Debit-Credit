import "server-only";
import { emailConfigured } from "../security/env";
export async function sendEmail(to: string, subject: string, url: string) {
  if (!emailConfigured()) throw new Error("EMAIL_UNAVAILABLE");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text: `${subject}\n${url}\nIgnore this message if you did not request it.`,
    }),
  });
  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
}

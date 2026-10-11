"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Download,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";
import QRCode from "qrcode";
import { requestJSON, cloudUser } from "@/lib/cloud/runtime";
import { roleCatalog } from "@/lib/career/catalog";
import type { ProfilePhoto } from "@/lib/career/photo";
import { socialKeys, socialLabels, type Showcase } from "@/lib/career/showcase";
import type { RoleId } from "@/lib/career/model";
import type { Locale } from "@/types";
const icons = {
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  website: Globe,
};
function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_UNAVAILABLE"));
    image.src = source;
  });
}
function line(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
) {
  let display = text;
  while (context.measureText(display).width > width && display.length > 1)
    display = display.slice(0, -1);
  context.fillText(
    display.length < text.length ? display.slice(0, -3) + "..." : display,
    x,
    y,
  );
}
export async function profileCardImage(
  data: Showcase,
  role: RoleId,
  url: string,
  photo: string | null,
) {
  await document.fonts.ready;
  const qr = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 400,
    color: { dark: "#143c47", light: "#ffffff" },
  });
  const [qrImage, portrait] = await Promise.all([
    loadImage(qr),
    photo ? loadImage(photo) : Promise.resolve(null),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1100;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  context.fillStyle = "#eaf6fa";
  context.fillRect(0, 0, 1600, 1100);
  const gradient = context.createLinearGradient(0, 0, 1600, 420);
  gradient.addColorStop(0, "#143c47");
  gradient.addColorStop(0.7, "#1e6267");
  gradient.addColorStop(1, "#c4b16d");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1600, 420);
  context.fillStyle = "#fff";
  context.font = "bold 28px Arial";
  context.fillText("Debit & Credit  /  PROFESSIONAL PROFILE", 64, 70);
  context.save();
  context.beginPath();
  context.arc(220, 238, 126, 0, 2 * Math.PI);
  context.clip();
  context.fillStyle = "#dcefe9";
  context.fillRect(94, 112, 252, 252);
  if (portrait) context.drawImage(portrait, 94, 112, 252, 252);
  else {
    context.fillStyle = "#143c47";
    context.font = "bold 70px Arial";
    context.textAlign = "center";
    context.fillText(
      data.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join(""),
      220,
      263,
    );
    context.textAlign = "left";
  }
  context.restore();
  context.strokeStyle = "#a5f1dc";
  context.lineWidth = 8;
  context.beginPath();
  context.arc(220, 238, 128, 0, 2 * Math.PI);
  context.stroke();
  context.fillStyle = "#fff";
  context.font = "bold 46px Arial";
  const words = data.name.split(/\s+/);
  let first = "";
  while (
    words.length &&
    context.measureText(first + " " + words[0]).width < 1090
  )
    first += (first ? " " : "") + words.shift();
  context.fillText(first, 410, 197);
  if (words.length) line(context, words.join(" "), 410, 254, 1090);
  context.fillStyle = "#f1e7bb";
  context.font = "bold 30px Arial";
  context.fillText(roleCatalog[role].label.en, 410, 323);
  context.font = "24px Arial";
  context.fillText(
    data.settings.availability.status === "internship"
      ? "Available for an internship · self-reported"
      : data.settings.availability.status === "work"
        ? "Open to work · self-reported"
        : "Accounting career profile",
    410,
    373,
  );
  context.fillStyle = "#143c47";
  context.font = "bold 30px Arial";
  context.fillText("CONNECT WITH ME", 64, 485);
  let y = 546;
  context.font = "25px Arial";
  for (const key of socialKeys.filter((key) => data.settings.socials[key])) {
    context.fillStyle = "#1e6267";
    context.font = "bold 25px Arial";
    context.fillText(socialLabels[key], 64, y);
    context.fillStyle = "#143c47";
    context.font = "25px Arial";
    line(
      context,
      data.settings.socials[key].replace(/^https:\/\/(www\.)?/, ""),
      64,
      y + 36,
      980,
    );
    y += 88;
  }
  if (y === 546) {
    context.fillStyle = "#536c82";
    context.fillText("Scan to view my selected professional profile.", 64, y);
  }
  context.drawImage(qrImage, 1110, 477, 400, 400);
  context.fillStyle = "#143c47";
  context.font = "bold 23px Arial";
  context.fillText("SCAN MY PROFILE", 1186, 906);
  context.fillStyle = "#1e6267";
  context.font = "22px Arial";
  context.fillText(
    "Accounting works are training simulations, not employment or professional certification.",
    64,
    1043,
  );
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("EXPORT_FAILED"))),
      "image/png",
    ),
  );
}
export function ProfessionalCard({
  owner,
  data,
  role,
  locale,
  url,
  qr,
}: {
  owner: string;
  data: Showcase;
  role: RoleId;
  locale: Locale;
  url: string;
  qr: string;
}) {
  const [saved, setSaved] = useState<{
    owner: string;
    image: string | null;
  } | null>(null);
  const [includePhoto, setIncludePhoto] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [refresh, setRefresh] = useState(0),
    [error, setError] = useState(false);
  const say = (en: string, ar: string) => (locale === "ar" ? ar : en);
  useEffect(() => {
    setIncludePhoto(true);
  }, [owner]);
  useEffect(() => {
    const changed = () => setRefresh((value) => value + 1);
    window.addEventListener("profile-photo-changed", changed);
    return () => window.removeEventListener("profile-photo-changed", changed);
  }, []);
  useEffect(() => {
    let alive = true;
    setSaved(null);
    setMessage("");
    setError(false);
    void requestJSON<ProfilePhoto>("me/photo")
      .then((result) => {
        if (alive && cloudUser() === owner)
          setSaved({ owner, image: result.data?.image ?? null });
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [owner, refresh]);
  const image = saved?.owner === owner ? saved.image : null;
  async function download() {
    setBusy(true);
    try {
      const blob = await profileCardImage(
        data,
        role,
        url,
        includePhoto ? image : null,
      );
      if (cloudUser() !== owner) return;
      const target = URL.createObjectURL(blob),
        anchor = document.createElement("a");
      anchor.href = target;
      anchor.download = "professional-profile-card.png";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(target), 10000);
      setMessage(
        say(
          "Card downloaded. PNG links are not clickable; scan the QR. Nothing was posted automatically.",
          "تم تنزيل الكارت. لينكات PNG مش قابلة للضغط؛ امسح QR. لم ننشر شيئًا تلقائيًا.",
        ),
      );
    } catch {
      setMessage(
        say("Card export failed. Retry.", "تعذّر تنزيل الكارت. حاول ثانية."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="profile-card-editor"
      data-testid="professional-profile-card"
    >
      <h3>{say("Your professional profile card", "كارت بروفايلك المهني")}</h3>
      <div className="profile-share-card" dir="ltr">
        <header>
          <small>Debit & Credit · PROFESSIONAL PROFILE</small>
          <div className="profile-card-identity">
            <div className="profile-card-portrait">
              {image && includePhoto ? (
                <Image
                  src={image}
                  alt={say(
                    "Your selected profile photo",
                    "صورتك المختارة للكارت",
                  )}
                  width={180}
                  height={180}
                  unoptimized
                />
              ) : (
                <span>
                  {data.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
              )}
            </div>
            <div>
              <h4>{data.name}</h4>
              <p>{roleCatalog[role].label.en}</p>
              {data.settings.availability.status !== "not-looking" && (
                <small>
                  {data.settings.availability.status === "internship"
                    ? "Available for an internship"
                    : "Open to work"}{" "}
                  · self-reported
                </small>
              )}
            </div>
          </div>
        </header>
        <div className="profile-card-body">
          <nav aria-label={say("Profile card social links", "لينكات الكارت")}>
            {socialKeys
              .filter((key) => data.settings.socials[key])
              .map((key) => {
                const Icon = icons[key];
                return (
                  <a
                    key={key}
                    href={data.settings.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                  >
                    <Icon size={19} />
                    <span>
                      {socialLabels[key]}
                      <small>
                        {data.settings.socials[key].replace(
                          /^https:\/\/(www\.)?/,
                          "",
                        )}
                      </small>
                    </span>
                  </a>
                );
              })}
          </nav>
          <div>
            {qr ? (
              <>
                <Image
                  src={qr}
                  alt={say("Public profile QR code", "QR البروفايل العام")}
                  width={180}
                  height={180}
                  unoptimized
                />
                <small>Scan my selected profile</small>
              </>
            ) : (
              <p>
                {say(
                  "Enable your public link in sharing settings to add a QR and download this card.",
                  "فعّل الرابط العام من إعدادات المشاركة علشان نضيف QR وتقدر تنزّل الكارت.",
                )}
              </p>
            )}
          </div>
        </div>
        <footer>
          Accounting works: training simulations, not employment or
          certification.
        </footer>
      </div>
      <label className="profile-card-photo-choice">
        <input
          type="checkbox"
          checked={includePhoto}
          onChange={(event) => setIncludePhoto(event.target.checked)}
        />
        {say(
          "Include my profile photo in the downloaded card",
          "أضف صورة البروفايل للكارت اللي هنزّله",
        )}
      </label>
      <p className="showcase-note">
        {say(
          "The downloaded card contains your name and saved social links. Its QR opens only the fields you allowed on the public link. Your photo is not added to that public page or the ATS CV. Once you share the image, copies cannot be revoked.",
          "الكارت المنزّل فيه اسمك وروابطك المحفوظة. QR يفتح فقط البيانات اللي سمحت بعرضها في الرابط العام. الصورة لا تُضاف للصفحة العامة أو CV بنظام ATS. نسخ الصورة بعد مشاركتها لا يمكن إلغاؤها.",
        )}
      </p>
      {error && (
        <p role="status">
          {say(
            "Photo could not load. Retry, or uncheck photo to export without it.",
            "تعذّر تحميل الصورة. حاول ثانية أو ألغِ اختيارها للتنزيل بدونها.",
          )}{" "}
          <button onClick={() => setRefresh((value) => value + 1)}>
            {say("Retry photo", "إعادة تحميل الصورة")}
          </button>
        </p>
      )}
      <button
        disabled={
          busy ||
          !qr ||
          !url ||
          (includePhoto && (saved?.owner !== owner || error))
        }
        onClick={() => void download()}
      >
        <Download size={17} />
        {say("Download profile card", "تنزيل كارت البروفايل")}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}

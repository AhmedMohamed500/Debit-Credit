"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Eye,
  Settings2,
  Info,
  X,
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
import type { RoleId, CareerProfile } from "@/lib/career/model";
import type { Locale } from "@/types";
const icons = {
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  instagram: Instagram,
  website: Globe,
};
type CardDetails = Pick<CareerProfile, "headline" | "location" | "country">;
const handle = (url: string) =>
  url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
const careerId = (data: Showcase) =>
  data.token ? "DC-" + data.token.slice(0, 12).toUpperCase() : "Debit & Credit";
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
  profile?: CardDetails,
) {
  if (
    !url ||
    !data.token ||
    new URL(url).pathname.split("/").pop() !== data.token
  )
    throw new Error("REAL_SHARE_LINK_REQUIRED");
  await document.fonts.ready;
  const qr = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 400,
    color: { dark: "#092b47", light: "#ffffff" },
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
  const gradient = context.createLinearGradient(0, 0, 1600, 740);
  gradient.addColorStop(0, "#061e35");
  gradient.addColorStop(0.8, "#123f50");
  gradient.addColorStop(1, "#827b54");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1600, 1100);
  context.strokeStyle = "#a99660";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(70, 130);
  context.lineTo(1530, 130);
  context.stroke();
  context.fillStyle = "#ffffff";
  context.font = "bold 36px Arial";
  context.fillText("Debit & Credit", 70, 87);
  context.font = "24px Arial";
  context.textAlign = "right";
  context.fillText("PROFESSIONAL PROFILE", 1530, 84);
  context.textAlign = "left";
  context.save();
  context.beginPath();
  context.roundRect(80, 230, 280, 280, 20);
  context.clip();
  context.fillStyle = "#dfefeb";
  context.fillRect(80, 230, 280, 280);
  if (portrait) {
    const size = Math.min(portrait.width, portrait.height);
    context.drawImage(
      portrait,
      (portrait.width - size) / 2,
      (portrait.height - size) / 2,
      size,
      size,
      80,
      230,
      280,
      280,
    );
  } else {
    context.fillStyle = "#123f50";
    context.font = "bold 72px Arial";
    context.textAlign = "center";
    context.fillText(
      data.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join(""),
      220,
      400,
    );
  }
  context.restore();
  context.textAlign = "left";
  context.fillStyle = "#ffffff";
  context.font = "bold 45px Arial";
  const words = data.name.split(/\s+/);
  let first = "";
  while (
    words.length &&
    context.measureText(first + " " + words[0]).width < 655
  )
    first += (first ? " " : "") + words.shift();
  line(context, first, 410, 262, 655);
  if (words.length) line(context, words.join(" "), 410, 320, 655);
  context.font = "bold 29px Arial";
  line(context, profile?.headline || roleCatalog[role].label.en, 410, 382, 655);
  context.fillStyle = "#e2d6ad";
  context.font = "25px Arial";
  line(context, "Target: " + roleCatalog[role].label.en, 410, 433, 655);
  context.fillStyle = "#ffffff";
  line(
    context,
    [profile?.location, profile?.country].filter(Boolean).join(", "),
    410,
    489,
    655,
  );
  if (data.settings.availability.status !== "not-looking") {
    context.fillStyle = "#009e8e";
    context.beginPath();
    context.roundRect(410, 525, 570, 52, 26);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = "24px Arial";
    line(
      context,
      data.settings.availability.status === "internship"
        ? "Available for an internship"
        : "Open to work",
      430,
      560,
      530,
    );
  }
  context.fillStyle = "#ffffff12";
  context.beginPath();
  context.roundRect(1110, 190, 420, 480, 18);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "24px Arial";
  context.textAlign = "center";
  context.fillText("CAREER ID", 1320, 233);
  context.font = "bold 26px Arial";
  context.fillText(careerId(data), 1320, 280);
  context.drawImage(qrImage, 1170, 310, 300, 300);
  context.font = "23px Arial";
  context.fillText("Scan my selected profile", 1320, 647);
  context.textAlign = "left";
  context.fillStyle = "#eaf5fa";
  context.fillRect(0, 740, 1600, 280);
  const links = socialKeys.filter((key) => data.settings.socials[key]);
  context.fillStyle = "#123f50";
  context.font = "bold 24px Arial";
  context.fillText("PROFESSIONAL LINKS", 70, 790);
  links.forEach((key, index) => {
    const x = 70 + (index % 2) * 780,
      y = 842 + Math.floor(index / 2) * 70;
    context.font = "bold 23px Arial";
    context.fillStyle = "#0b354f";
    context.fillText(socialLabels[key], x, y);
    context.font = "22px Arial";
    context.fillStyle = "#245d6b";
    line(context, handle(data.settings.socials[key]), x, y + 29, 710);
  });
  if (!links.length) {
    context.font = "24px Arial";
    context.fillText("Scan to view my selected professional profile.", 70, 860);
  }
  context.fillStyle = "#08283e";
  context.fillRect(0, 1020, 1600, 80);
  context.fillStyle = "#e2d6ad";
  context.font = "23px Arial";
  context.fillText(
    "Accounting practice through training simulations — not employment or certification.",
    70,
    1068,
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
  profile,
  onSharing,
}: {
  owner: string;
  data: Showcase;
  role: RoleId;
  locale: Locale;
  url: string;
  qr: string;
  profile: CardDetails;
  onSharing: () => void;
}) {
  const [saved, setSaved] = useState<{
    owner: string;
    image: string | null;
  } | null>(null);
  const [includePhoto, setIncludePhoto] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [refresh, setRefresh] = useState(0),
    [error, setError] = useState(false),
    [preview, setPreview] = useState(false);
  const say = (en: string, ar: string) => (locale === "ar" ? ar : en);
  useEffect(() => {
    setIncludePhoto(true);
    setPreview(false);
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
  useEffect(() => {
    if (!preview) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [preview]);
  const image = saved?.owner === owner ? saved.image : null,
    ready = Boolean(qr && url && data.token);
  const shareSettings = () => {
    setPreview(false);
    onSharing();
  };
  async function download() {
    if (!ready) return;
    setBusy(true);
    try {
      const blob = await profileCardImage(
        data,
        role,
        url,
        includePhoto ? image : null,
        profile,
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
          "PNG downloaded. Links are text; scan the QR. Nothing was posted automatically.",
          "تم تنزيل PNG. الروابط نصية؛ امسح QR. لم ننشر شيئًا تلقائيًا.",
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
  const cardView = (
    <div className="profile-share-card" dir="ltr" data-share-enabled={ready}>
      <header className="career-card-brand">
        <b>Debit & Credit</b>
        <small>PROFESSIONAL PROFILE</small>
      </header>
      <div className="career-card-main">
        <div className="profile-card-portrait">
          {image && includePhoto ? (
            <Image
              src={image}
              alt={say("Your selected profile photo", "صورتك المختارة للكارت")}
              width={180}
              height={180}
              unoptimized
            />
          ) : (
            <span>
              {data.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
          )}
        </div>
        <div className="profile-card-identity">
          <h4 dir="auto">{data.name}</h4>
          <p>{profile.headline || roleCatalog[role].label.en}</p>
          <small>Target: {roleCatalog[role].label.en}</small>
          <small dir="auto">
            {[profile.location, profile.country].filter(Boolean).join(", ")}
          </small>
          {data.settings.availability.status !== "not-looking" && (
            <span className="card-availability">
              {data.settings.availability.status === "internship"
                ? "Available for an internship"
                : "Open to work"}
            </span>
          )}
        </div>
        <div className="profile-card-body">
          <small>Career ID</small>
          <b>{careerId(data)}</b>
          {ready ? (
            <>
              <Image
                src={qr}
                alt={say("Public profile QR code", "QR البروفايل العام")}
                width={180}
                height={180}
                unoptimized
              />
              <a href={url} target="_blank" rel="noopener noreferrer">
                {say("View public profile", "عرض البروفايل العام")}
              </a>
              <button onClick={shareSettings}>{say("Share", "مشاركة")}</button>
            </>
          ) : (
            <div className="card-qr-off">
              <b>{say("Sharing is off", "المشاركة غير مفعلة")}</b>
              <p>
                {say(
                  "Activate your share link to create a real QR",
                  "فعّل رابط المشاركة لإنشاء QR حقيقي",
                )}
              </p>
              <button onClick={shareSettings}>
                {say("Activate sharing", "تفعيل المشاركة")}
              </button>
            </div>
          )}
        </div>
      </div>
      <nav
        className="career-card-links"
        aria-label={say("Profile card social links", "لينكات الكارت")}
      >
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
                <Icon size={15} />
                <span>
                  {socialLabels[key]}
                  <small>{handle(data.settings.socials[key])}</small>
                </span>
              </a>
            );
          })}
      </nav>
      <footer>
        Accounting practice through training simulations — not employment or
        certification.
      </footer>
    </div>
  );
  return (
    <div
      className="profile-card-editor"
      data-testid="professional-profile-card"
    >
      <h3>{say("Your professional Career Pass", "كارت هويتك المهنية")}</h3>
      {cardView}
      <div className="career-card-actions">
        <button onClick={() => setPreview(true)}>
          <Eye size={16} />
          {say("Preview", "معاينة")}
        </button>
        <button onClick={shareSettings}>
          <Settings2 size={16} />
          {say("Share settings", "إعداد المشاركة")}
        </button>
        <button
          disabled={
            busy ||
            !ready ||
            (includePhoto && (saved?.owner !== owner || error))
          }
          onClick={() => void download()}
        >
          <Download size={16} />
          {say("Download profile card", "تنزيل كارت البروفايل")}
        </button>
      </div>
      {!ready && (
        <small className="card-download-help">
          {say(
            "Activate sharing first to create a real QR and download the card.",
            "فعّل رابط المشاركة أولًا لإنشاء QR حقيقي وتنزيل الكارت.",
          )}
        </small>
      )}
      <label className="profile-card-photo-choice">
        <span>
          {say("Profile photo on card", "صورة البروفايل على الكارت")}
          <small>{say("Affects the card only.", "يؤثر على الكارت فقط.")}</small>
        </span>
        <span className="card-photo-control" dir="ltr">
          <input
            role="switch"
            dir="ltr"
            type="checkbox"
            checked={includePhoto}
            onChange={(event) => setIncludePhoto(event.target.checked)}
          />
          <span
            className="card-photo-track"
            aria-hidden="true"
            data-on={includePhoto}
          >
            <span />
          </span>
          <b className="card-photo-state">{includePhoto ? "ON" : "OFF"}</b>
        </span>
      </label>
      <details className="card-privacy-help">
        <summary>
          <Info size={14} />
          {say(
            "Card content is independent of your selected public-page fields.",
            "ما يظهر على الكارت مستقل عن الحقول التي تختار عرضها في الصفحة العامة.",
          )}
        </summary>
        <p>
          {say(
            "The PNG includes your name and saved links. Its QR exposes only public selections. Photo is not published on that page or added to the ATS CV. Shared image copies cannot be revoked.",
            "PNG يتضمن اسمك وروابطك المحفوظة. QR يعرض الحقول المختارة فقط. الصورة لا تنشر على الصفحة العامة أو CV. نسخ الكارت التي شاركتها لا يمكن إلغاؤها.",
          )}
        </p>
      </details>
      {error && (
        <p role="status">
          {say(
            "Photo unavailable. Retry or switch photo off.",
            "تعذّر تحميل الصورة. حاول ثانية أو أوقف الصورة.",
          )}{" "}
          <button onClick={() => setRefresh((value) => value + 1)}>
            {say("Retry photo", "إعادة تحميل الصورة")}
          </button>
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {preview &&
        createPortal(
          <div
            className="career-card-modal"
            role="dialog"
            aria-modal="true"
            aria-label={say("Career Pass preview", "معاينة الكارت المهني")}
          >
            <button
              className="card-preview-close"
              autoFocus
              onClick={() => setPreview(false)}
              aria-label={say("Close preview", "إغلاق المعاينة")}
            >
              <X />
            </button>
            {cardView}
          </div>,
          document.body,
        )}
    </div>
  );
}

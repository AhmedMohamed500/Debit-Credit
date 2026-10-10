"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, UserRound } from "lucide-react";
import { useCloudIdentity } from "@/components/cloud/session-boundary";
import { requestJSON, CloudFailure } from "@/lib/cloud/runtime";
import {
  PROFILE_PHOTO_SIZE,
  PHOTO_FILE_LIMIT,
  type ProfilePhoto as PhotoRecord,
} from "@/lib/career/photo";
import type { Locale } from "@/types";
import "@/app/profile-photo.css";

async function prepare(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > PHOTO_FILE_LIMIT
  )
    throw new Error("INVALID_FILE");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000)
      throw new Error("IMAGE_TOO_LARGE");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = PROFILE_PHOTO_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("CANVAS_UNAVAILABLE");
    const size = Math.min(bitmap.width, bitmap.height);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      bitmap,
      (bitmap.width - size) / 2,
      (bitmap.height - size) / 2,
      size,
      size,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    bitmap.close();
  }
}
export function ProfilePhoto({
  locale,
  editable = false,
  name = "",
}: {
  locale: Locale;
  editable?: boolean;
  name?: string;
}) {
  const identity = useCloudIdentity(),
    owner = identity?.user.id;
  const [saved, setSaved] = useState<PhotoRecord | null>(null),
    [loadedOwner, setLoadedOwner] = useState<string | undefined>(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const say = (en: string, ar: string) => (locale === "ar" ? ar : en);
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!owner) return;
      try {
        const next = await requestJSON<PhotoRecord>("me/photo");
        if (alive) {
          setSaved(next);
          setLoadedOwner(owner);
        }
      } catch {
        if (alive) setSaved(null);
      }
    }
    setSaved(null);
    setMessage("");
    void load();
    window.addEventListener("profile-photo-changed", load);
    return () => {
      alive = false;
      window.removeEventListener("profile-photo-changed", load);
    };
  }, [owner]);
  async function save(image: string | null) {
    if (!saved || !owner || loadedOwner !== owner) return;
    const result = await requestJSON<PhotoRecord>("me/photo", "PUT", {
      revision: saved.revision,
      image,
    });
    setSaved(result);
    window.dispatchEvent(new Event("profile-photo-changed"));
    setMessage(
      say(
        "Profile photo saved. It is not included in your ATS CV.",
        "الصورة اتحفظت للبروفايل فقط، وليست ضمن الـCV.",
      ),
    );
  }
  const current = loadedOwner === owner ? saved : null;
  return (
    <div
      className={`profile-photo ${editable ? "photo-editor" : "photo-avatar"}`}
    >
      <span className="photo-circle">
        {current?.data?.image ? (
          <Image
            src={current.data.image}
            alt={say("Profile photo", "صورة البروفايل")}
            width={96}
            height={96}
            unoptimized
          />
        ) : name ? (
          <b aria-label={say("Profile initials", "الحروف الأولى للاسم")}>
            {name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </b>
        ) : (
          <UserRound aria-hidden="true" />
        )}
      </span>
      {editable && (
        <div>
          <b>
            {say(
              "Your profile photo (optional)",
              "صورتك على البروفايل (اختياري)",
            )}
          </b>
          <p>
            {say(
              "Square 512 × 512. JPG, PNG or WebP, up to 5 MB. Center-cropped; location metadata removed. Private to your account; not published in competitions or added to the CV.",
              "مربع 512 × 512. JPG أو PNG أو WebP حتى 5MB. قصّ من المنتصف وإزالة بيانات الموقع. خاصة بحسابك، ولا تُنشر بالمنافسات أو تُضاف للـCV.",
            )}
          </p>
          <label className="photo-upload">
            <Camera size={18} />
            {busy
              ? say("Saving…", "جارٍ الحفظ…")
              : say("Upload / replace photo", "ارفع / غيّر الصورة")}
            <input
              aria-label={say("Upload profile photo", "رفع صورة البروفايل")}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || !current}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file || busy) return;
                setBusy(true);
                setMessage("");
                try {
                  await save(await prepare(file));
                } catch (error) {
                  setMessage(
                    error instanceof CloudFailure && error.status === 409
                      ? say(
                          "Photo changed in another tab. Reload before saving.",
                          "الصورة اتغيرت في تبويب آخر. حدّث الصفحة قبل الحفظ.",
                        )
                      : say(
                          "Not saved. Use JPG, PNG or WebP up to 5 MB; check your connection and retry.",
                          "لم تُحفظ. استخدم JPG أو PNG أو WebP حتى 5MB وراجع الاتصال وحاول ثانية.",
                        ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {current?.data?.image && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await save(null);
                } catch {
                  setMessage(
                    say(
                      "Removal not confirmed. Retry.",
                      "لم يتأكد حذف الصورة. حاول ثانية.",
                    ),
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {say("Remove photo", "إزالة الصورة")}
            </button>
          )}
          <p role="status">{message}</p>
        </div>
      )}
    </div>
  );
}

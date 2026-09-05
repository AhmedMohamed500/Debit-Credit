import type { AcademyProgress } from "@/types";
import { recordGameActivity } from "@/lib/game/progress";

const KEY = "debit-credit-progress-v1";
const empty: AcademyProgress = { completedLessonIds: [], quizScores: {} };

export function loadAcademyProgress(): AcademyProgress {
  if (typeof window === "undefined") return empty;
  try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return empty; }
}

export function saveAcademyProgress(progress: AcademyProgress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent("academy-progress-updated", { detail: progress }));
}

export function completeAcademyLesson(lessonId: string, score?: number) {
  const current = loadAcademyProgress(), completedLessonIds = current.completedLessonIds.includes(lessonId) ? current.completedLessonIds : [...current.completedLessonIds, lessonId];
  const quizScores = score === undefined ? current.quizScores : { ...current.quizScores, [lessonId]: score };
  const next = { completedLessonIds, quizScores, lastLessonId: lessonId };
  saveAcademyProgress(next);
  recordGameActivity("lesson", lessonId, score ?? 100, lessonId.includes("journal") ? ["journal-entries"] : lessonId.includes("trial") ? ["trial-balance"] : ["fundamentals"]);
  return next;
}


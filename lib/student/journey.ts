import type { Locale } from "@/types";
import { stepIds } from "./unit";

export function studentJourney({
  locale,
  pathname,
  personalComplete,
  accepted,
  shiftCompleted,
  advancedRoute = "/onboarding",
}: {
  locale: Locale;
  pathname: string;
  personalComplete: boolean;
  accepted: string[];
  shiftCompleted: number;
  advancedRoute?: string;
}) {
  const count = new Set(accepted.filter((id) => stepIds.includes(id))).size;
  const path = (suffix: string) => `/${locale}${suffix}`;
  const steps = [
    {
      id: "personal",
      route: path("/student-profile"),
      title: { ar: "بياناتي", en: "My details" },
      done: personalComplete,
      detail: personalComplete ? "✓" : "",
    },
    {
      id: "training",
      route: path("/game/student"),
      title: { ar: "تدريب الأساس", en: "Foundations desk" },
      done: count === stepIds.length,
      detail: `${count}/${stepIds.length}`,
    },
    {
      id: "shift",
      route: path("/game/first-shift"),
      title: { ar: "أول وردية", en: "First shift" },
      done: shiftCompleted >= 5,
      detail: `${Math.min(5, shiftCompleted)}/5`,
    },
    {
      id: "skills",
      route: path("/career-profile/skills"),
      title: { ar: "مهاراتي", en: "My skills" },
      done: false,
      detail: "",
    },
    {
      id: "cv",
      route: path("/career-profile/cv"),
      title: { ar: "الـCV الإنجليزي", en: "English CV" },
      done: false,
      detail: "",
    },
  ];
  const current =
    steps.find(
      (step) =>
        pathname === step.route || pathname.startsWith(`${step.route}/`),
    ) ?? (pathname === path("/student") ? steps[1] : undefined);
  const next = !personalComplete
    ? steps[0]
    : count < stepIds.length
      ? steps[1]
      : shiftCompleted < 5
        ? steps[2]
        : current?.id === "skills"
          ? steps[4]
          : current?.id === "cv"
            ? null
            : steps[3];
  return {
    steps,
    current,
    next,
    nextRoute: next?.route ?? path(advancedRoute),
    count,
    inCurrentTask: Boolean(next && current?.id === next.id),
    foundationsDone: count === stepIds.length,
    shiftDone: shiftCompleted >= 5,
  };
}

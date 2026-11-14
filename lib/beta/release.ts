import { z } from "zod";

export const betaEventSchema = z
  .object({
    event: z.enum([
      "session_seen",
      "first_mission_started",
      "first_mission_completed",
    ]),
  })
  .strict();

export const betaFeedbackSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    topic: z.enum(["clarity", "navigation", "technical", "other"]),
    comment: z.string().trim().max(500).default(""),
  })
  .strict();

export type BetaEvent = z.infer<typeof betaEventSchema>["event"];

export type BetaMetrics = {
  schemaVersion: 1;
  events: {
    signup?: string;
    firstMissionStarted?: string;
    firstMissionCompleted?: string;
    returningLearner?: string;
  };
  lastSeenAt?: string;
};

export const emptyBetaMetrics = (): BetaMetrics => ({
  schemaVersion: 1,
  events: {},
});

export function advanceBetaMetrics(
  value: unknown,
  event: BetaEvent,
  now = new Date(),
  returningAfterMs = 30 * 60 * 1000,
): BetaMetrics {
  const current = normalizeBetaMetrics(value);
  const timestamp = now.toISOString();
  const events = { ...current.events };

  if (event === "session_seen") {
    events.signup ??= timestamp;
    const previousSeen = current.lastSeenAt
      ? new Date(current.lastSeenAt).getTime()
      : Number.NaN;
    if (
      events.firstMissionStarted &&
      !events.returningLearner &&
      Number.isFinite(previousSeen) &&
      now.getTime() - previousSeen >= returningAfterMs
    )
      events.returningLearner = timestamp;
    return { schemaVersion: 1, events, lastSeenAt: timestamp };
  }

  if (event === "first_mission_started")
    events.firstMissionStarted ??= timestamp;
  if (event === "first_mission_completed") {
    events.firstMissionStarted ??= timestamp;
    events.firstMissionCompleted ??= timestamp;
  }
  return { ...current, schemaVersion: 1, events };
}

function normalizeBetaMetrics(value: unknown): BetaMetrics {
  if (!value || typeof value !== "object") return emptyBetaMetrics();
  const candidate = value as Partial<BetaMetrics>;
  const source =
    candidate.events && typeof candidate.events === "object"
      ? candidate.events
      : {};
  const validTimestamp = (item: unknown) =>
    typeof item === "string" && Number.isFinite(new Date(item).getTime())
      ? item
      : undefined;
  return {
    schemaVersion: 1,
    events: {
      signup: validTimestamp(source.signup),
      firstMissionStarted: validTimestamp(source.firstMissionStarted),
      firstMissionCompleted: validTimestamp(source.firstMissionCompleted),
      returningLearner: validTimestamp(source.returningLearner),
    },
    lastSeenAt: validTimestamp(candidate.lastSeenAt),
  };
}

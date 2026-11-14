import { describe, expect, it } from "vitest";
import {
  advanceBetaMetrics,
  betaEventSchema,
  betaFeedbackSchema,
} from "@/lib/beta/release";

describe("student beta release telemetry", () => {
  it("stores only first milestone timestamps and no personal payload", () => {
    const first = advanceBetaMetrics(
      null,
      "session_seen",
      new Date("2026-11-14T08:00:00.000Z"),
    );
    const started = advanceBetaMetrics(
      first,
      "first_mission_started",
      new Date("2026-11-14T08:05:00.000Z"),
    );
    const repeated = advanceBetaMetrics(
      started,
      "first_mission_started",
      new Date("2026-11-14T08:10:00.000Z"),
    );
    expect(repeated.events).toEqual({
      signup: "2026-11-14T08:00:00.000Z",
      firstMissionStarted: "2026-11-14T08:05:00.000Z",
      firstMissionCompleted: undefined,
      returningLearner: undefined,
    });
    expect(JSON.stringify(repeated)).not.toMatch(/email|name|phone|device/i);
  });

  it("counts a returning learner only after a meaningful gap and a mission start", () => {
    let metrics = advanceBetaMetrics(
      null,
      "session_seen",
      new Date("2026-11-14T08:00:00.000Z"),
    );
    metrics = advanceBetaMetrics(
      metrics,
      "first_mission_started",
      new Date("2026-11-14T08:01:00.000Z"),
    );
    metrics = advanceBetaMetrics(
      metrics,
      "session_seen",
      new Date("2026-11-14T08:10:00.000Z"),
    );
    expect(metrics.events.returningLearner).toBeUndefined();
    metrics = advanceBetaMetrics(
      metrics,
      "session_seen",
      new Date("2026-11-14T09:00:00.000Z"),
    );
    expect(metrics.events.returningLearner).toBe("2026-11-14T09:00:00.000Z");
  });

  it("validates bounded events and privacy-conscious feedback", () => {
    expect(betaEventSchema.safeParse({ event: "first_mission_completed" }).success).toBe(true);
    expect(betaEventSchema.safeParse({ event: "page_view", path: "/private" }).success).toBe(false);
    expect(
      betaFeedbackSchema.safeParse({
        rating: 5,
        topic: "clarity",
        comment: "Clear and useful",
      }).success,
    ).toBe(true);
    expect(
      betaFeedbackSchema.safeParse({
        rating: 5,
        topic: "clarity",
        comment: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});

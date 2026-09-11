import { describe, expect, it } from "vitest";
import { accountLearningGuide } from "@/data/account-learning-guide";
import { accountManualMarkdown } from "@/lib/account-manual-markdown";

describe("downloadable accounting reference", () => {
  it("includes every account and its full original accounting content", () => {
    const markdown = accountManualMarkdown();
    expect((markdown.match(/^### /gm) ?? []).length).toBe(accountLearningGuide.length);
    for (const account of accountLearningGuide) {
      expect(markdown).toContain(`### ${account.code} — ${account.nameAr} / ${account.nameEn}`);
      for (const field of ["normalAr", "normalEn", "increaseSideAr", "decreaseSideAr", "increaseEffectAr", "decreaseEffectAr", "statementAr", "documentsAr", "exampleAr", "cycleAr"] as const) {
        expect(markdown).toContain(account[field]);
      }
    }
  });
});

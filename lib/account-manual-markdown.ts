import { accountGuideCategories, accountLearningGuide } from "@/data/account-learning-guide";

/** The downloadable reference uses exactly the same records as the game manual. */
export function accountManualMarkdown() {
  const sections = accountGuideCategories.map(category => {
    const accounts = accountLearningGuide.filter(account => account.category === category.id);
    return [
      `## ${category.ar} / ${category.en} — ${accounts.length}`,
      ...accounts.map(account => [
        `### ${account.code} — ${account.nameAr} / ${account.nameEn}`,
        `- التصنيف / Category: ${account.categoryAr} (${account.category})`,
        `- الطبيعة / Normal nature: ${account.normalAr} / ${account.normalEn}`,
        `- عند الزيادة / Increase: ${account.increaseSideAr}`,
        account.increaseEffectAr,
        `- عند النقص / Decrease: ${account.decreaseSideAr}`,
        account.decreaseEffectAr,
        `**موضعه في القوائم المالية / Financial statement**\n\n${account.statementAr}`,
        `**المستندات المؤيدة / Supporting documents**\n\n${account.documentsAr}`,
        `**مثال القيد / Journal entry example**\n\n${account.exampleAr}`,
        `**الدورة المستندية / Document trail**\n\n${account.cycleAr}`,
      ].join("\n\n")),
    ].join("\n\n");
  });
  return [
    "# طبيعة الحسابات / Nature of Accounts",
    "Debit & Credit — by Money Coder",
    `مرجع الحسابات داخل اللعبة — ${accountLearningGuide.length} حسابًا من بيانات المشروع الأصلية.`,
    "This reference contains the same accounts, codes and accounting rules as the in-game manual. Detailed explanations remain in their approved source language.",
    ...sections,
    "",
  ].join("\n\n");
}

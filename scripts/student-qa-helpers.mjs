export async function completeStudentDetails(page) {
  // The initial server form can be replaced while CloudSessionBoundary hydrates.
  // Wait for its ready-only account bar before filling uncontrolled fields.
  await page.locator('.cloud-account-bar button').waitFor();
  await page.locator('[name="fullName"]').fill("Student CV Fixture");
  const fields = {
    phone: "+20 100 123 4567",
    country: "Egypt",
    location: "Cairo",
    institution: "Fixture University",
    degree: "BCom (in progress)",
    field: "Accounting",
    graduationYear: "2028",
    languages: "Arabic, English",
  };
  for (const [name, value] of Object.entries(fields))
    await page.locator(`[name="${name}"]`).fill(value);
  await page.locator(".student-card form button").click();
  await page.waitForURL((url) => !url.pathname.includes("student-profile"));
  await page.waitForLoadState("load");
}

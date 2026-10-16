// Invoked only by the isolated localhost student browser harness.
import sharp from "sharp";
let previousCertificate;
export async function memberProfileQa({ page, context, base, locale, label, api, record, screenshot, checkLayout }) {
  if (!base.startsWith("http://localhost:")) throw new Error("Local fixtures only");
  const say = (en, ar) => locale === "ar" ? ar : en;
  await page.waitForFunction(() => document.querySelector('.member-feedback button') === null);
  const root = page.locator('.member-profile');
  await page.locator('.career-approved-tabs').getByRole('link', {name:say('Overview','نظرة عامة'),exact:true}).click();
  record(label + " no duplicate journey navigation above the profile", await page.locator('.student-journey-bar').count() === 0);
  record(label + " professional next step follows saved journey progress", await page.locator('.candidate-next a').first().getAttribute('href') === (label === 'en-1440' ? '/en/career-profile/skills' : `/${locale}/game/first-shift`));
  record(label + " dark theme preserves readable career surfaces", await page.locator('.career-approved').evaluate(element => { document.documentElement.setAttribute('data-theme', 'dark'); const style=getComputedStyle(element); return style.backgroundColor !== 'rgb(255, 255, 255)' && style.color !== style.backgroundColor; }));
  await screenshot(page, label + '-profile-overview-dark'); await checkLayout(page, label + ' profile overview dark');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  record(label + " approved profile has one white navbar and one navy career sidebar", await page.locator('.member-sidebar:visible, .member-top:visible, .student-journey-bar:visible').count() === 0 && await page.locator('.career-approved-header').evaluate(element => getComputedStyle(element).backgroundColor === 'rgb(255, 255, 255)') && await page.locator('.career-approved-sidebar:visible').count() <= 1);
  record(label + " genuine profile photo fills its visible frame", await page.locator('.approved-overview-identity .member-portrait img').evaluate(element => { const photo=element.getBoundingClientRect(), frame=element.closest('.member-portrait').getBoundingClientRect(); return photo.width >= frame.width - 2 && photo.height >= frame.height - 2; }));
  await screenshot(page, label + '-profile-overview-approved'); await checkLayout(page, label + ' profile overview approved');
  await page.locator('.career-approved-tabs').getByRole('link', { name: say('Courses', 'الكورسات'), exact: true }).click();
  await page.getByRole('button', { name: say('Add course', 'أضف كورس'), exact: true }).click();
  await page.locator('.member-form [name="title"]').fill('Excel for Accountants');
  await page.locator('.member-form [name="provider"]').fill('Local QA University');
  await page.locator('.member-form [name="titleEn"]').fill('Excel for Accountants');
  await page.locator('.member-form [name="providerEn"]').fill('Local QA University');
  await page.locator('.member-form [name="date"]').fill('2026-09');
  await page.locator('.member-form [name="notes"]').fill('Trial balance and spreadsheet workpapers');
  await page.getByRole('button', { name: say('Save course', 'احفظ الكورس'), exact: true }).click();
  await page.locator('.member-record').getByText('Excel for Accountants', { exact: true }).waitFor();
  let portfolio = await (await api(context, 'me/portfolio')).json();
  record(label + " manually entered course saved on account", portfolio.courses.length === 1 && portfolio.courses[0].status === 'in-progress');
  record(label + ' optional English CV names persist with the profile course', portfolio.courses[0].titleEn === 'Excel for Accountants' && portfolio.courses[0].providerEn === 'Local QA University');
  record(label + " account CV includes saved course immediately as in progress", (await (await api(context,'me/cv')).json()).data.plainText.includes('Excel for Accountants | Local QA University | 2026-09 | In progress'));
  const course = portfolio.courses[0];
  await page.getByRole('button', { name: `${say('Edit', 'تعديل')} ${course.title}`, exact: true }).click();
  await page.locator('.member-form [name="status"]').selectOption('completed');
  await page.getByRole('button', { name: say('Save course', 'احفظ الكورس'), exact: true }).click();
  await page.locator('.member-record .member-pill[data-completed="true"]').waitFor();
  record(label + " course edits persist without duplicate records", (await (await api(context, 'me/portfolio')).json()).courses.length === 1);
  record(label + " course completion updates CV without generating or opening it", (await (await api(context,'me/cv')).json()).data.plainText.includes('Excel for Accountants | Local QA University | 2026-09 | Completed'));
  await page.goto(`${base}/${locale}/career-profile/cv`);await page.locator('.professional-cv').waitFor();
  record(label + ' CV page uses current account course and professional link', (await page.locator('.professional-cv').innerText()).includes('Excel for Accountants') && (await page.locator('.professional-cv').innerText()).includes('local-qa-fixture'));
  await screenshot(page,label+'-cv-with-course');
  if (label.endsWith('1440')) {
    const originalViewport = page.viewportSize();
    for (const viewport of [{width:1920,height:1080},{width:1440,height:900},{width:1024,height:900},{width:390,height:844}]) {
      await page.setViewportSize(viewport);
      const caption = `${locale}-career-cv-${viewport.width}`;
      await screenshot(page, caption);
      await checkLayout(page, caption);
      const previewFit = await page.locator('.ats-studio-preview-scroll').evaluate(element => ({
        scroll: element.scrollWidth,
        visible: element.clientWidth,
      }));
      record(caption + ' default A4 preview fits without clipping its left edge', previewFit.scroll <= previewFit.visible + 2);
      record(caption + ' PDF, Word and readiness controls are visible', await page.getByRole('button', {name:say('Download PDF','تحميل PDF')}).isVisible() && await page.getByRole('button', {name:say('Download Word','تحميل Word')}).isVisible() && await page.locator('.ats-studio-score strong').isVisible());
      if (viewport.width >= 1440) {
        const document = await page.locator('.ats-studio-preview').boundingBox(), readiness = await page.locator('.ats-studio-readiness').boundingBox();
        record(caption + ' readiness sits physically right of the CV preview', readiness.x >= document.x + document.width - 1);
      }
      if (viewport.width === 1440 || viewport.width === 390) {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await screenshot(page, caption + '-dark'); await checkLayout(page, caption + ' dark');
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      }
    }
    await page.setViewportSize(originalViewport);
  }
  await page.goto(`${base}/${locale}/career-profile#courses`);await page.locator('.member-record').getByText('Excel for Accountants',{exact:true}).waitFor();
  await screenshot(page, label + '-profile-courses'); await checkLayout(page, label + ' profile courses');
  await page.locator('.career-approved-tabs').getByRole('link', { name: say('Certificates', 'الشهادات'), exact: true }).click();
  await page.getByRole('button', { name: say('Add certificate', 'أضف شهادة'), exact: true }).click();
  await page.locator('.member-form [name="title"]').fill('Financial Reporting Certificate');
  await page.locator('.member-form [name="issuer"]').fill('Local QA University');
  await page.locator('.member-form [name="date"]').fill('2026-10');
  await page.locator('.member-form [name="credentialId"]').fill('LOCAL-FIXTURE-001');
  // Labeled, non-personal document fixture. Never upload real user certificates in QA.
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200"><rect width="1800" height="1200" fill="#f6f2de"/><rect x="50" y="50" width="1700" height="1100" fill="none" stroke="#205d63" stroke-width="16"/><text x="900" y="380" text-anchor="middle" font-size="80" fill="#205d63">LOCAL QA CERTIFICATE</text><text x="900" y="620" text-anchor="middle" font-size="48" fill="#205d63">Not a real credential</text></svg>';
  const document = await sharp(Buffer.from(svg)).jpeg().withMetadata().toBuffer();
  const evidenceBefore = (await (await api(context, 'me/progress')).json()).evidence.length;
  await page.locator('.member-form [name="image"]').setInputFiles({ name: 'local-certificate.jpg', mimeType: 'image/jpeg', buffer: document });
  await page.getByRole('button', { name: say('Save certificate', 'احفظ الشهادة'), exact: true }).click();
  await page.getByRole('heading', { name: 'Financial Reporting Certificate', exact: true }).waitFor();
  portfolio = await (await api(context, 'me/portfolio')).json();
  const certificate = portfolio.certificates[0];
  record(label + " certificate metadata saves privately without image bytes in listing", portfolio.certificates.length === 1 && !JSON.stringify(portfolio).includes('data:image'));
  const imageResponse = await api(context, 'me/certificates/' + certificate.id), savedImage = await imageResponse.json();
  const meta = await sharp(Buffer.from(savedImage.image.split(',')[1], 'base64')).metadata();
  record(label + " full certificate aspect preserved and metadata stripped", meta.width === 1600 && meta.height === 1067 && !meta.exif);
  record(label + " private image response never cached publicly", imageResponse.headers()['cache-control'] === 'private, no-store');
  record(label + " certificates and external courses do not award assessed skill evidence", (await (await api(context, 'me/progress')).json()).evidence.length === evidenceBefore);
  const certificateCv=(await (await api(context,'me/cv')).json()).data.plainText;
  record(label + ' certificate enters CV as self-reported text only',certificateCv.includes('CERTIFICATES (SELF-REPORTED)') && certificateCv.includes('Financial Reporting Certificate') && !certificateCv.includes('data:image') && !certificateCv.includes('LOCAL-FIXTURE-001'));
  const progressText = await (await api(context, 'me/progress')).text(), board = await (await api(context, 'competition/leaderboard')).text();
  record(label + " private documents excluded from progress backup and leaderboard", !progressText.includes(savedImage.image) && !progressText.includes('Financial Reporting Certificate') && !board.includes('LOCAL-FIXTURE-001'));
  if (previousCertificate) record(label + " another authenticated owner cannot read prior certificate", (await api(context, 'me/certificates/' + previousCertificate)).status() === 404);
  record(label + " image endpoint ignores forged owner query", (await (await api(context, 'me/certificates/' + certificate.id + '?userId=victim')).json()).image === savedImage.image);
  record(label + " stale certificate revision rejected", (await api(context, 'me/portfolio', 'PUT', { action: 'remove-certificate', revision: 0, id: certificate.id })).status() === 409);
  record(label + " portfolio owner injection rejected", (await api(context, 'me/portfolio', 'PUT', { action: 'remove-certificate', revision: portfolio.revision, id: certificate.id, userId: 'victim' })).status() === 400);
  record(label + " corrupt certificate rejected", (await api(context, 'me/portfolio', 'PUT', { action: 'add-certificate', revision: portfolio.revision, certificate: { title: 'Invalid Certificate', issuer: 'School', date: '', credentialId: '' }, image: 'data:image/png;base64,AAAA' })).status() === 400);
  record(label + " cross-origin writes rejected", (await context.request.put(base + '/api/v1/me/portfolio', { headers: { Origin: 'https://attacker.example' }, data: { action: 'remove-certificate', revision: portfolio.revision, id: certificate.id } })).status() === 403);
  await screenshot(page, label + '-profile-certificates'); await checkLayout(page, label + ' certificates');
  await page.getByRole('button', { name: say('View certificate image', 'عرض صورة الشهادة'), exact: true }).click();
  await page.getByRole('dialog').waitFor();
  record(label + " private document opens accessible modal at original aspect", await page.getByRole('dialog').locator('img').isVisible());
  await screenshot(page, label + '-certificate-preview'); await checkLayout(page, label + ' certificate preview');
  await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.reload(); await page.getByRole('heading', { name: 'Financial Reporting Certificate', exact: true }).waitFor();
  record(label + " certificate and active section restored after reload");
  // Exercise all supported personas without altering the existing student journey.
  const original = (await (await api(context, 'me')).json()).profile;
  const persona = locale === 'en' ? (label.includes('1440') ? 'working-accountant' : 'experienced-accountant') : (label.includes('1440') ? 'student' : 'graduate');
  const profilePayload = (row, persona) => ({ displayName: row.displayName, handle: row.handle, avatar: row.avatar, locale: row.locale, persona, targetRoleId: row.targetRoleId, revision: row.updatedAt });
  record(label + ' persona fixture configured', (await api(context, 'me/profile', 'PUT', profilePayload(original, persona))).ok());
  await page.reload(); await page.getByRole('heading', { name: 'Financial Reporting Certificate', exact: true }).waitFor();
  record(label + ` ${persona} uses same personal profile and certificate sections`, await root.isVisible());
  await screenshot(page, label + '-persona-' + persona);
  const now = (await (await api(context, 'me')).json()).profile;
  record(label + ' persona fixture restored', (await api(context, 'me/profile', 'PUT', profilePayload(now, original.persona))).ok());
  const anonymous = await context.browser().newContext();
  record(label + ' signed-out portfolio protected', (await api(anonymous, 'me/portfolio')).status() === 401);
  record(label + ' signed-out certificate image protected', (await api(anonymous, 'me/certificates/' + certificate.id)).status() === 401);
  await anonymous.close();
  await page.getByRole('button', { name: `${say('Remove', 'حذف')} Financial Reporting Certificate`, exact: true }).click();
  await page.getByRole('heading', { name: 'Financial Reporting Certificate', exact: true }).waitFor({ state: 'detached' });
  record(label + ' certificate removal deletes its private image', (await api(context, 'me/certificates/' + certificate.id)).status() === 404);
  record(label + ' certificate removal also updates CV',!(await (await api(context,'me/cv')).json()).data.plainText.includes('Financial Reporting Certificate'));
  await page.locator('.career-approved-tabs').getByRole('link', { name: say('Courses', 'الكورسات'), exact: true }).click();
  await page.getByRole('button', { name: `${say('Remove', 'حذف')} Excel for Accountants`, exact: true }).click();
  await page.getByText('Excel for Accountants', { exact: true }).waitFor({ state: 'detached' });
  record(label + ' course removal persists', (await (await api(context, 'me/portfolio')).json()).courses.length === 0);
  record(label + ' deleted course no longer appears in current CV',!(await (await api(context,'me/cv')).json()).data.plainText.includes('Excel for Accountants'));
  const final = await (await api(context, 'me/portfolio')).json();
  const isolation = await (await api(context, 'me/portfolio', 'PUT', { action: 'add-certificate', revision: final.revision, certificate: { title: 'Owner isolation QA fixture', issuer: 'Local test only', date: '', credentialId: '' }, image: savedImage.image })).json();
  previousCertificate = isolation.certificates[0].id;
  record(label + ' prior-owner isolation fixture actually exists', (await api(context, 'me/certificates/' + previousCertificate)).status() === 200);
}

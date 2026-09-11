import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8081/api';

const OUTPUT_DIR = path.resolve('../screenshots');
const FRONTEND_OUTPUT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(FRONTEND_OUTPUT_DIR)) fs.mkdirSync(FRONTEND_OUTPUT_DIR, { recursive: true });

async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Logging in test accounts...');
  const studentAuth = await loginApi('alice.smith@student.com', 'Student@123');
  const instructorAuth = await loginApi('john.doe@elearning.com', 'Instructor@123');
  const adminAuth = await loginApi('admin@elearning.com', 'Admin@123');

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const setAuth = async (authObj) => {
    await page.evaluate((auth) => {
      if (!auth) {
        localStorage.removeItem('elearning_token');
        localStorage.removeItem('elearning_user');
      } else {
        localStorage.setItem('elearning_token', auth.accessToken);
        localStorage.setItem('elearning_user', JSON.stringify(auth));
      }
    }, authObj);
  };

  const capture = async (filename, relativeUrl, authObj, customAction = null) => {
    console.log(`\nCapturing ${filename} at ${relativeUrl}...`);
    // Navigate to blank or base first to set localStorage cleanly if needed
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await setAuth(authObj);
    await sleep(200);

    await page.goto(`${BASE_URL}${relativeUrl}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500); // Wait for animations & renders

    if (customAction) {
      try {
        await customAction(page);
        await sleep(1000);
      } catch (err) {
        console.warn(`Custom action warning for ${filename}:`, err.message);
      }
    }

    const outPath1 = path.join(OUTPUT_DIR, filename);
    const outPath2 = path.join(FRONTEND_OUTPUT_DIR, filename);
    await page.screenshot({ path: outPath1, fullPage: false });
    fs.copyFileSync(outPath1, outPath2);
    console.log(`Saved ${filename} (${fs.statSync(outPath1).size} bytes)`);
  };

  try {
    // 01 - Home
    await capture('01-home.png', '/', null);

    // 02 - Marketplace
    await capture('02-marketplace.png', '/courses', null);

    // 03 - Course Details
    await capture('03-course-details.png', '/courses/3', null);

    // 04 - Student Dashboard
    await capture('04-student-dashboard.png', '/student', studentAuth);

    // 05 - Learning Classroom
    await capture('05-learning-classroom.png', '/student/learn/3', studentAuth);

    // 06 - Quiz
    await capture('06-quiz.png', '/student/quizzes/2', studentAuth);

    // 07 - Certificate
    await capture('07-certificate.png', '/student/certificates', studentAuth, async (p) => {
      // If there is a view certificate button, click it to show modal
      const viewBtn = await p.$('button:has-text("View"), button:has-text("Certificate"), button[title*="Certificate"]');
      if (viewBtn) await viewBtn.click();
      else {
        // Find any card button
        const cardBtns = await p.$$('button');
        for (const btn of cardBtns) {
          const text = await p.evaluate(el => el.textContent, btn);
          if (text && (text.includes('View') || text.includes('Certificate'))) {
            await btn.click();
            break;
          }
        }
      }
    });

    // 08 - Instructor Dashboard
    await capture('08-instructor-dashboard.png', '/instructor', instructorAuth);

    // 09 - Course Builder
    await capture('09-course-builder.png', '/instructor/courses/3/edit', instructorAuth, async (p) => {
      // Click Curriculum tab to show curriculum builder
      const tabs = await p.$$('button');
      for (const t of tabs) {
        const text = await p.evaluate(el => el.textContent, t);
        if (text && text.includes('Curriculum')) {
          await t.click();
          break;
        }
      }
    });

    // 10 - Quiz Builder
    await capture('10-quiz-builder.png', '/instructor/quizzes/3/edit', instructorAuth);

    // 11 - Instructor Analytics
    await capture('11-instructor-analytics.png', '/instructor/analytics', instructorAuth);

    // 12 - Admin Dashboard
    await capture('12-admin-dashboard.png', '/admin', adminAuth);

    // 13 - Course Moderation
    await capture('13-course-moderation.png', '/admin/moderation', adminAuth);

    // 14 - User Management
    await capture('14-user-management.png', '/admin/users', adminAuth);

    console.log('\nAll 14 screenshots successfully captured!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});

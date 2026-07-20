// Records a real run through the public booking wizard (against the
// `demo-cleaning-service` demo provider) as a video, for use in outreach.
//
// Usage: node scripts/demo/record-booking-demo.mjs [outDir]
//
// Requires the chromium shared libs to be resolvable (see
// scripts/demo/chromium-ld-library-path.txt for the non-root workaround used
// on this box) — export LD_LIBRARY_PATH before running if chromium fails to
// launch with a "cannot open shared object file" error.

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://letsbook.maakhq.com';
const SLUG = 'demo-cleaning-service';
const DEMO_ADDRESS = '350 Fifth Avenue, New York';
const CUSTOMER = {
    name: 'Jordan Ellis',
    phone: '(416) 555-0148',
    email: 'jordan.ellis@yopmail.com',
};

const outDir = process.argv[2] || fs.mkdtempSync('/tmp/booking-demo-');
fs.mkdirSync(outDir, { recursive: true });

function log(msg) {
    console.log(`[record-booking-demo] ${msg}`);
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
    });
    const page = await context.newPage();

    log(`Loading ${BASE_URL}/business/${SLUG}`);
    await page.goto(`${BASE_URL}/business/${SLUG}`, { waitUntil: 'networkidle' });

    const props = await page.evaluate(() => JSON.parse(document.getElementById('app').dataset.page).props);
    const availableDaysOfWeek = new Set((props.availability || []).map((a) => a.day_of_week));
    if (availableDaysOfWeek.size === 0) throw new Error('Demo provider has no availability configured.');

    let targetDate = null;
    for (let i = 1; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        if (availableDaysOfWeek.has(d.getDay())) {
            targetDate = d;
            break;
        }
    }
    if (!targetDate) throw new Error('No available date found in the 14-day booking window.');
    const dayLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = String(targetDate.getDate());
    log(`Target date: ${dayLabel} ${dayNumber}`);

    // --- Address ---
    log('Address search');
    await page.locator('#address-search').pressSequentially(DEMO_ADDRESS, { delay: 45 });
    await page.waitForSelector('#address-suggestions [role="option"]', { timeout: 15000 });
    await page.waitForTimeout(700);
    await page.click('#address-suggestions [role="option"]:first-child');
    await page.waitForTimeout(900);
    await page.locator('button').filter({ hasText: 'Continue' }).click();

    // --- Step 1: Home type ---
    log('Home type');
    await page.waitForSelector('text=What kind of property needs cleaning?');
    await page.waitForTimeout(800);
    await page.getByText('2BHK Apartment', { exact: false }).click();

    // --- Step 2: Services ---
    log('Services');
    await page.waitForSelector('text=Add Services');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add Standard Cleaning (2BHK)' }).click();
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: 'Add Fridge Cleaning Add-on' }).click();
    await page.waitForTimeout(800);
    await page.locator('button').filter({ hasText: 'Continue' }).click();

    // --- Step 3: Date & time ---
    log('Date & time');
    await page.waitForSelector('text=When do you need us?');
    await page.waitForTimeout(500);
    const dateButton = page.locator('button').filter({ hasText: dayLabel }).filter({ hasText: dayNumber });
    await dateButton.first().click();
    await page.waitForTimeout(900);
    const slot = page
        .locator('button:not([disabled])')
        .filter({ hasText: /\d{1,2}:00\s?(AM|PM)/ });
    await slot.first().click();
    await page.waitForTimeout(700);
    await page.locator('button').filter({ hasText: 'Proceed' }).click();

    // --- Step 4: Details ---
    log('Contact details');
    await page.waitForSelector('#customer-name');
    await page.waitForTimeout(400);
    await page.locator('#customer-name').pressSequentially(CUSTOMER.name, { delay: 55 });
    await page.waitForTimeout(250);
    await page.locator('#customer-phone').pressSequentially(CUSTOMER.phone, { delay: 55 });
    await page.waitForTimeout(250);
    await page.locator('#customer-email').pressSequentially(CUSTOMER.email, { delay: 40 });
    await page.waitForTimeout(400);
    await page.locator('[role="radio"]').filter({ hasText: 'Cash' }).click();
    await page.waitForTimeout(400);
    const oneHourReminder = page.locator('[role="radio"]').filter({ hasText: '1 hour before' });
    if (await oneHourReminder.count()) {
        await oneHourReminder.first().click();
    }
    await page.waitForTimeout(700);

    log('Submitting booking');
    await page.locator('button').filter({ hasText: 'Confirm Booking' }).click();
    await page.waitForSelector('text=Booking Confirmed!', { timeout: 20000 });

    const referenceId = await page.locator('text=Ref').locator('..').locator('p.font-mono').textContent();
    log(`Booking confirmed, reference: ${referenceId?.trim()}`);

    await page.waitForTimeout(3000);

    const video = page.video();
    await context.close();
    const videoPath = await video.path();
    await browser.close();

    log(`Video saved: ${videoPath}`);
    log(`Reference ID to verify/clean up in DB: ${referenceId?.trim()}`);
}

main().catch((err) => {
    console.error('[record-booking-demo] FAILED:', err);
    process.exit(1);
});

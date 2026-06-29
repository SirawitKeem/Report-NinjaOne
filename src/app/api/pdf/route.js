import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import {
  loadScheduleConfig,
  getScheduleConfigPath,
  computeRange,
  buildTemplateVars,
  renderTemplate,
  toAddressList,
  convertNewlinesToBrs,
} from '../../lib/reportConfig';
import { orgStorage, getActiveOrg } from '../../lib/ninjaClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

process.env.TZ = 'Asia/Bangkok';

const TZ = 'Asia/Bangkok';
const BASE_URL = process.env.PDF_BASE_URL || 'http://127.0.0.1:3000';

// Warn if PDF_BASE_URL is not explicitly set in production
if (process.env.NODE_ENV === 'production' && !process.env.PDF_BASE_URL) {
  console.warn('[route.js] WARNING: PDF_BASE_URL is not set. Defaulting to http://127.0.0.1:3000. Set this env var explicitly for production deployments.');
}

// ─── API Key Authentication ───────────────────────────────────────────────────
// All mutation endpoints (POST, PUT) and the config GET endpoint require
// a valid API key passed as the Authorization header: Bearer <INTERNAL_API_KEY>
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

function checkApiKey(request) {
  if (!INTERNAL_API_KEY) return; // If no key configured, skip check (dev mode)
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== INTERNAL_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null; // null = authorized
}

// ─── CSRF Origin Check ────────────────────────────────────────────────────────
// Reject cross-origin mutation requests that don't come from the same host
function checkOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.includes(host)) {
    return new Response(JSON.stringify({ error: 'Forbidden: Cross-origin request rejected.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null; // null = allowed
}

// ─── PUT Body Schema Validation ───────────────────────────────────────────────
const VALID_ORGS = ['officemate', 'tracthai'];
const VALID_DATE_RANGES = ['daily', 'weekly', 'monthly', 'custom'];
const VALID_TIMEZONES = ['Asia/Bangkok', 'UTC', 'Asia/Singapore', 'Asia/Tokyo'];
const CRON_REGEX = /^(\*|\d+(?:,\d+)*|\*\/\d+|\d+-\d+)\s+(\*|\d+(?:,\d+)*|\*\/\d+|\d+-\d+)\s+(\*|\d+(?:,\d+)*|\*\/\d+|\d+-\d+)\s+(\*|\d+(?:,\d+)*|\*\/\d+|\d+-\d+)\s+(\*|\d+(?:,\d+)*|\*\/\d+|\d+-\d+)$/;

function validatePutBody(body) {
  const errors = [];
  if (body.cron !== undefined && !CRON_REGEX.test(String(body.cron).trim())) {
    errors.push('cron: must be a valid 5-field cron expression');
  }
  if (body.dateRange !== undefined && !VALID_DATE_RANGES.includes(body.dateRange)) {
    errors.push(`dateRange: must be one of ${VALID_DATE_RANGES.join(', ')}`);
  }
  if (body.timezone !== undefined && !VALID_TIMEZONES.includes(body.timezone)) {
    errors.push(`timezone: must be one of ${VALID_TIMEZONES.join(', ')}`);
  }
  if (body.fileNameTemplate !== undefined && typeof body.fileNameTemplate !== 'string') {
    errors.push('fileNameTemplate: must be a string');
  }
  if (body.email !== undefined) {
    if (body.email.to !== undefined && !Array.isArray(body.email.to)) {
      errors.push('email.to: must be an array');
    }
    if (body.email.cc !== undefined && !Array.isArray(body.email.cc)) {
      errors.push('email.cc: must be an array');
    }
  }
  return errors;
}

// ─── Email Address Masker ─────────────────────────────────────────────────────
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  return local.slice(0, 2) + '****@' + domain;
}
function maskEmailList(list) {
  if (!Array.isArray(list)) return list;
  return list.map(maskEmail);
}

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

async function sendGraphMail({ to, cc, subject, html, pdfBuffer, fileName }) {
  const token = await getAccessToken();

  const payload = {
    message: {
      subject,
      body: { contentType: 'HTML', content: html },
      toRecipients: toAddressList(to).map((address) => ({ emailAddress: { address } })),
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: fileName,
          contentType: 'application/pdf',
          contentBytes: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    },
    saveToSentItems: true,
  };

  const ccAddresses = toAddressList(cc);
  if (ccAddresses.length > 0) {
    payload.message.ccRecipients = ccAddresses.map((address) => ({ emailAddress: { address } }));
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${process.env.EMAIL_FROM}/sendMail`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) throw new Error(await response.text());
}

async function generateReportPdf(orgKey) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setDefaultTimeout(120000);
    await page.setDefaultNavigationTimeout(120000);
    await page.setViewport({ width: 1200, height: 1200 });
    
    // Explicitly pass the active organization key in the query parameter
    const targetUrl = `${BASE_URL}/?org=${orgKey}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    
    // ✅ รอให้โครงสร้างเนื้อหาของแต่ละหน้าเรนเดอร์สำเร็จ เพื่อแก้ปัญหาหน้า PDF ว่างเปล่า
    await page.waitForSelector('div.break-before-page', { timeout: 120000 });
    // ✅ หน่วงเวลาเล็กน้อยเพื่อให้ Animation แผนภูมิกราฟขยายแถบสีข้อมูลได้เสร็จสมบูรณ์
    await new Promise((r) => setTimeout(r, 2500));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    await page.close();

    return pdf;
  } finally {
    if (browser) await browser.close();
  }
}

async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function GET(request) {
  const authError = checkApiKey(request);
  if (authError) return authError;

  const url = new URL(request.url);
  // Resolve organization key from query params, cookies, or default
  let orgKey = url.searchParams.get('org') || request.cookies?.get('active_org')?.value || 'officemate';
  if (orgKey !== 'officemate' && orgKey !== 'tracthai') orgKey = 'officemate';

  return await orgStorage.run(orgKey, async () => {
    const config = await loadScheduleConfig();
    const range = computeRange(config, TZ);
    const vars = buildTemplateVars(config, range);

    return new Response(
      JSON.stringify({
        config,
        range,
        preview: {
          to: toAddressList(config.email?.to),
          cc: toAddressList(config.email?.cc),
          subject: renderTemplate(config.email?.subjectTemplate ?? '', vars),
          body: renderTemplate(config.email?.bodyTemplate ?? '', vars),
          fileName: renderTemplate(config.fileNameTemplate ?? 'report-{fromShort}-{untilShort}.pdf', vars),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}

export async function POST(request) {
  const authError = checkApiKey(request);
  if (authError) return authError;
  const csrfError = checkOrigin(request);
  if (csrfError) return csrfError;

  try {
    const body = await parseJsonBody(request);
    const url = new URL(request.url);

    // Resolve organization context: POST body first, then query param, then request cookie
    let orgKey = body.org || url.searchParams.get('org') || request.cookies?.get('active_org')?.value || 'officemate';
    if (orgKey !== 'officemate' && orgKey !== 'tracthai') orgKey = 'officemate';

    return await orgStorage.run(orgKey, async () => {
      const config = await loadScheduleConfig();

      const mergedConfig = {
        ...config,
        ...body,
        email: {
          ...(config.email || {}),
          ...(body.email || {}),
        },
      };

      if (!mergedConfig.email?.to || (Array.isArray(mergedConfig.email.to) && !mergedConfig.email.to.length)) {
        return new Response(JSON.stringify({ error: 'No recipient configured in schedule config or request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const range = computeRange(mergedConfig, TZ);
      const vars = buildTemplateVars(mergedConfig, range);
      const subject = renderTemplate(mergedConfig.email?.subjectTemplate ?? 'Scheduled report', vars);
      const rawHtml = renderTemplate(mergedConfig.email?.bodyTemplate ?? '', vars);
      const html = convertNewlinesToBrs(rawHtml);
      const fileName = renderTemplate(mergedConfig.fileNameTemplate ?? 'report-{fromShort}-{untilShort}.pdf', vars);
      
      // Generate PDF matching target organization branding and content
      const pdfBuffer = await generateReportPdf(orgKey);

      // Send Mail
      await sendGraphMail({
        to: mergedConfig.email.to,
        cc: mergedConfig.email.cc,
        subject,
        html,
        pdfBuffer,
        fileName,
      });

      return new Response(
        JSON.stringify({ success: true, fileName }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  } catch (error) {
    console.error("❌ POST Send Email Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error during PDF generation or email dispatch.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(request) {
  const authError = checkApiKey(request);
  if (authError) return authError;
  const csrfError = checkOrigin(request);
  if (csrfError) return csrfError;

  try {
    const body = await parseJsonBody(request);
    const url = new URL(request.url);

    // Validate PUT body schema before writing to disk
    const validationErrors = validatePutBody(body);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: validationErrors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Resolve organization context: PUT body first, then query param, then request cookie
    let orgKey = body.org || url.searchParams.get('org') || request.cookies?.get('active_org')?.value || 'officemate';
    if (orgKey !== 'officemate' && orgKey !== 'tracthai') orgKey = 'officemate';

    return await orgStorage.run(orgKey, async () => {
      const config = await loadScheduleConfig();

      // Merge only schedule-related properties
      const updatedConfig = {
        ...config,
        enabled: body.enabled !== undefined ? body.enabled : config.enabled,
        cron: body.cron ?? config.cron,
        dateRange: body.dateRange ?? config.dateRange,
        timezone: body.timezone ?? config.timezone,
        fileNameTemplate: body.fileNameTemplate ?? config.fileNameTemplate,
        email: {
          ...(config.email || {}),
          ...(body.email || {}),
        }
      };

      const configPath = await getScheduleConfigPath();
      await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

      return new Response(
        JSON.stringify({ success: true, config: updatedConfig }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  } catch (error) {
    console.error("❌ PUT Schedule Config Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

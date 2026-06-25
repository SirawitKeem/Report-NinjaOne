import fs from 'fs/promises';
import path from 'path';
import { getActiveOrg } from './ninjaClient';

export function getScheduleConfigPath() {
  const org = getActiveOrg();
  return path.join(process.cwd(), 'src', 'config', `pdf-schedule-${org}.json`);
}

function formatIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatLongDate(date, timeZone) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  });
}

function normalizeDate(value, timeZone) {
  if (!value) {
    return new Date(new Date().toLocaleString('en-US', { timeZone }));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(new Date(value).toLocaleString('en-US', { timeZone }));
  }

  return parsed;
}

export async function loadScheduleConfig() {
  const configPath = getScheduleConfigPath();
  try {
    const payload = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(payload);
  } catch (e) {
    // If the org-specific configuration does not exist, try to load the fallback
    const fallbackPath = path.join(process.cwd(), 'src', 'config', 'pdf-schedule.json');
    try {
      const payload = await fs.readFile(fallbackPath, 'utf-8');
      return JSON.parse(payload);
    } catch (err) {
      // Return a blank default template configuration
      return {
        enabled: false,
        cron: "0 8 1 * *",
        timezone: "Asia/Bangkok",
        dateRange: "monthly",
        fileNameTemplate: "report-{fromShort}-{untilShort}.pdf",
        email: {
          to: [],
          cc: [],
          subjectTemplate: "NinjaOne Monthly Report",
          bodyTemplate: "Dear Team,\n\nPlease find attached the monthly report."
        }
      };
    }
  }
}

export function computeRange(config = {}, timeZone = 'UTC') {
  const { from, until, dateRange = 'monthly' } = config;
  const now = normalizeDate(undefined, timeZone);

  let startDate;
  let endDate;

  if (from && until) {
    startDate = normalizeDate(from, timeZone);
    endDate = normalizeDate(until, timeZone);
  } else if (dateRange === 'daily') {
    endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 1);
    startDate = new Date(endDate);
  } else if (dateRange === 'weekly') {
    endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 1);
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
  } else if (dateRange === 'quarterly') {
    const currentMonth = now.getMonth(); // 0-11
    const currentQuarter = Math.floor(currentMonth / 3); // 0-3
    const prevQuarter = (currentQuarter - 1 + 4) % 4;
    const year = now.getFullYear() + (currentQuarter === 0 ? -1 : 0);
    startDate = new Date(Date.UTC(year, prevQuarter * 3, 1));
    endDate = new Date(Date.UTC(year, (prevQuarter + 1) * 3, 0));
  } else if (dateRange === 'yearly') {
    const prevYear = now.getFullYear() - 1;
    startDate = new Date(Date.UTC(prevYear, 0, 1));
    endDate = new Date(Date.UTC(prevYear, 11, 31));
  } else {
    const year = now.getFullYear();
    const month = now.getMonth();
    startDate = new Date(Date.UTC(year, month - 1, 1));
    endDate = new Date(Date.UTC(year, month, 0));
  }

  const fromShort = formatIsoDate(startDate).replace(/-/g, '');
  const untilShort = formatIsoDate(endDate).replace(/-/g, '');
  const fromLong = formatLongDate(startDate, timeZone);
  const untilLong = formatLongDate(endDate, timeZone);

  // Helper date for retrieving localized month/year
  const localDate = new Date(endDate.toLocaleString('en-US', { timeZone }));
  const monthName = localDate.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = localDate.toLocaleDateString('en-US', { month: 'short' });
  const year = localDate.toLocaleDateString('en-US', { year: 'numeric' });
  const monthNumeric = String(localDate.getMonth() + 1).padStart(2, '0');
  
  const monthNameThai = localDate.toLocaleDateString('th-TH', { month: 'long' });
  const monthShortThai = localDate.toLocaleDateString('th-TH', { month: 'short' });
  const yearThai = String(localDate.getFullYear() + 543);

  // Current date parameters based on execution time
  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long' });
  const currentMonthNameThai = now.toLocaleDateString('th-TH', { month: 'long' });
  const currentYear = now.toLocaleDateString('en-US', { year: 'numeric' });
  const currentYearThai = String(now.getFullYear() + 543);
  const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentDateThai = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentDateShort = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return {
    from: formatIsoDate(startDate),
    until: formatIsoDate(endDate),
    fromShort,
    untilShort,
    fromLong,
    untilLong,
    dateRange,
    monthName,
    monthShort,
    year,
    monthNumeric,
    monthNameThai,
    monthShortThai,
    yearThai,
    currentMonthName,
    currentMonthNameThai,
    currentYear,
    currentYearThai,
    currentDate,
    currentDateThai,
    currentDateShort,
  };
}

export function buildTemplateVars(config = {}, range = {}) {
  const vars = {
    ...range,
    ...config,
    email: config.email || {},
  };
  
  // Legacy aliases for backward compatibility with saved templates
  if (!vars['Month Year']) {
    vars['Month Year'] = `${range.monthNameThai || ''} ${range.yearThai || ''}`.trim();
  }
  if (!vars['MonthYear']) {
    vars['MonthYear'] = `${range.monthName || ''}${range.year || ''}`.trim();
  }
  
  return vars;
}

export function renderTemplate(template = '', vars = {}) {
  return String(template).replace(/\{([^}]+)\}/g, (_, key) => {
    const value = vars[key] ?? vars.email?.[key] ?? '';
    return String(value);
  });
}

export function toAddressList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value)
    .split(/[;,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function convertNewlinesToBrs(text) {
  if (!text) return '';
  let html = text.replace(/\r?\n/g, '<br />');
  // Clean up <br /> after/before block tags to prevent weird vertical gaps
  html = html.replace(/(<(?:ul|ol|li|p|div|table|tr|td|thead|tbody)[^>]*>)<br\s*\/?>/gi, '$1');
  html = html.replace(/<br\s*\/?>((<\/(?:ul|ol|li|p|div|table|tr|td|thead|tbody)>))/gi, '$1');
  return html;
}


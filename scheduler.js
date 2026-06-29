const fs = require('fs/promises');
const path = require('path');

const API_URL = 'http://127.0.0.1:3000/api/pdf';
const ORGS = ['officemate', 'tracthai'];

function matchesCron(cronStr, date) {
  const parts = cronStr.split(/\s+/);
  if (parts.length !== 5) return false;

  const min = date.getMinutes();
  const hr = date.getHours();
  const dom = date.getDate();
  const mon = date.getMonth() + 1; // 1-12
  const dow = date.getDay(); // 0-6

  const checkField = (field, currentVal) => {
    if (field === '*') return true;
    const options = field.split(',').map(Number);
    return options.includes(currentVal);
  };

  return checkField(parts[0], min) &&
         checkField(parts[1], hr) &&
         checkField(parts[2], dom) &&
         checkField(parts[3], mon) &&
         checkField(parts[4], dow);
}

// Track the last triggered datetime string per org to prevent duplicate runs
// Key format: "YYYY-MM-DD HH:mm" — resets naturally each new day/minute
const lastTriggeredByOrg = {};

async function checkAndTrigger() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

  // Build a full datetime key: "2026-06-29 08:00"
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  for (const org of ORGS) {
    const configPath = path.join(__dirname, 'src', 'config', `pdf-schedule-${org}.json`);
    try {
      let data;
      try {
        data = await fs.readFile(configPath, 'utf-8');
      } catch (e) {
        // Fallback for officemate if the scoped file doesn't exist yet
        if (org === 'officemate') {
          const fallbackPath = path.join(__dirname, 'src', 'config', 'pdf-schedule.json');
          data = await fs.readFile(fallbackPath, 'utf-8');
        } else {
          continue; // Skip if no config for this org
        }
      }

      const config = JSON.parse(data);
      if (!config.enabled) continue;

      // Prevent duplicate triggering for the same org at the same minute on the same day
      if (lastTriggeredByOrg[org] === dateKey) {
        continue;
      }

      if (matchesCron(config.cron, now)) {
        console.log(`[${now.toLocaleTimeString('th-TH')}] 🕒 Cron match found for "${org}": "${config.cron}". Triggering PDF report send...`);

        // Lock immediately to prevent duplicate runs within the same minute
        lastTriggeredByOrg[org] = dateKey;

        // Include API key for internal authentication
        const apiKey = process.env.INTERNAL_API_KEY || '';
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({ org })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          console.log(`[${now.toLocaleTimeString('th-TH')}] ✅ Report for "${org}" sent successfully! File: ${result.fileName}`);
        } else {
          console.error(`[${now.toLocaleTimeString('th-TH')}] ❌ Failed to send report for "${org}":`, result.error || response.statusText);
        }
      }
    } catch (err) {
      console.error(`[${now.toLocaleTimeString('th-TH')}] ❌ Scheduler error for "${org}":`, err.message);
    }
  }
}

console.log('🚀 NinjaOne Report Scheduler Daemon started!');
console.log('Orgs monitored: ' + ORGS.join(', '));
console.log('Timezone: Asia/Bangkok');

// Check every 10 seconds to catch minute changes reliably
setInterval(checkAndTrigger, 10000);
checkAndTrigger();

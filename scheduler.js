const fs = require('fs/promises');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'src', 'config', 'pdf-schedule.json');
const API_URL = 'http://localhost:3000/api/pdf';

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

let lastTriggeredMinute = -1;

async function checkAndTrigger() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  // Prevent multiple triggers in the same minute
  if (currentMinute === lastTriggeredMinute) return;

  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(data);

    if (!config.enabled) return;

    if (matchesCron(config.cron, now)) {
      lastTriggeredMinute = currentMinute;
      console.log(`[${now.toLocaleTimeString('th-TH')}] 🕒 Cron match found: "${config.cron}". Triggering PDF report send...`);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body triggers sending using saved config
      });

      const result = await response.json();
      if (response.ok && result.success) {
        console.log(`[${now.toLocaleTimeString('th-TH')}] ✅ Report sent successfully! File: ${result.fileName}`);
      } else {
        console.error(`[${now.toLocaleTimeString('th-TH')}] ❌ Failed to send report:`, result.error || response.statusText);
      }
    }
  } catch (err) {
    console.error(`[${now.toLocaleTimeString('th-TH')}] ❌ Scheduler error:`, err.message);
  }
}

console.log('🚀 NinjaOne Report Scheduler Daemon started!');
console.log(`Watching configuration: ${CONFIG_PATH}`);
console.log(`Target endpoint: ${API_URL}`);
console.log('Timezone: Asia/Bangkok');

// Check every 10 seconds to catch minute changes reliably
setInterval(checkAndTrigger, 10000);
checkAndTrigger();

import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { getOsPatchesNo } from './os_patches_no';

const CACHE_DIR = path.join(process.cwd(), 'src', 'config');
const CACHE_PATH = path.join(CACHE_DIR, 'cve-cache.json');

// Helper to normalize impact string
export const normalizeImpact = (impact) => {
  const val = String(impact || "").toUpperCase();
  if (val === "CRITICAL")    return "critical";
  if (val === "RECOMMENDED") return "recommended";
  if (val === "OPTIONAL")    return "optional";
  return "unknown";
};

// Helper to load cache
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Helper to save cache
async function saveCache(cache) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error("❌ Failed to write CVE cache:", err);
  }
}

// Helper to fetch from Microsoft MSRC API
async function fetchMsrcForKb(kb) {
  const cleanKb = kb.replace("KB", "").trim();
  const url = `https://api.msrc.microsoft.com/sug/v2.0/en-US/affectedProduct?%24filter=kbArticles/any(a%3A+a/articleName+eq+%27${cleanKb}%27)&$top=500`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error(`❌ Failed to fetch CVEs for KB ${kb}: status ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.value || [];
  } catch (err) {
    console.error(`❌ Error fetching CVEs for KB ${kb}:`, err);
    return [];
  }
}

// Wrapped with React cache() for request-level memoization:
// All server components on the same page render that call getOsCveData()
// will share a single fetch result instead of triggering 3 separate MSRC API calls.
export const getOsCveData = cache(async function getOsCveDataImpl() {
  try {
    // 1. Get pending patches KBs
    const pendingPatches = await getOsPatchesNo();
    const kbs = [...new Set(pendingPatches.map(p => p.kbNumber).filter(Boolean))];

    // 2. Load existing cache
    const cveCache = await loadCache();
    let updated = false;

    // 3. Fetch missing KBs
    for (const kb of kbs) {
      if (!cveCache[kb]) {
        const records = await fetchMsrcForKb(kb);
        cveCache[kb] = records;
        updated = true;
        // Small delay to prevent rate limits
        await new Promise(r => setTimeout(r, 200));
      }
    }

    // 4. Save cache if new items fetched
    if (updated) {
      await saveCache(cveCache);
    }

    // 5. Combine and process records for pending KBs
    const allCvesRaw = [];
    kbs.forEach(kb => {
      if (cveCache[kb]) {
        allCvesRaw.push(...cveCache[kb]);
      }
    });

    // 6. Group and deduplicate by cveNumber
    const cveMap = new Map();
    allCvesRaw.forEach(item => {
      const cveId = item.cveNumber;
      if (!cveId) return;

      // Extract CVSS score
      let baseScore = null;
      if (item.baseScore) {
        baseScore = parseFloat(item.baseScore);
      } else if (item.cvssScoreSets && item.cvssScoreSets.length > 0) {
        baseScore = parseFloat(item.cvssScoreSets[0].baseScore);
      }

      // If still null, map severity to default score
      if (baseScore === null || isNaN(baseScore)) {
        const sev = (item.severity || "").toUpperCase();
        if (sev === "CRITICAL") baseScore = 9.0;
        else if (sev === "IMPORTANT") baseScore = 7.0;
        else if (sev === "MODERATE") baseScore = 4.0;
        else if (sev === "LOW") baseScore = 1.0;
        else baseScore = 0.0;
      }

      // Determine CVSS Level
      let level = "None";
      if (baseScore >= 9.0) level = "Critical";
      else if (baseScore >= 7.0) level = "High";
      else if (baseScore >= 4.0) level = "Medium";
      else if (baseScore > 0) level = "Low";

      const cveRecord = {
        CVE_ID: cveId,
        Severity: item.severity || "Unknown",
        Impact: item.impact || "Unknown",
        Product: item.product || "Unknown",
        Product_Family: item.productFamily || "Unknown",
        Release_Date: item.releaseDate,
        Initial_Release_Date: item.initialReleaseDate,
        CVSS_Base_Score: baseScore,
        CVSS_Level: level,
        CWE_List: (item.cweList || []).join(" | "),
        KB_Number: (item.kbArticles && item.kbArticles.length > 0) ? "KB" + item.kbArticles[0].articleName : "No KB"
      };

      // If a CVE is listed multiple times, keep the one with the highest base score
      if (!cveMap.has(cveId)) {
        cveMap.set(cveId, cveRecord);
      } else {
        const existing = cveMap.get(cveId);
        if (baseScore > existing.CVSS_Base_Score) {
          cveMap.set(cveId, cveRecord);
        }
      }
    });

    const uniqueCves = Array.from(cveMap.values());
    return uniqueCves;

  } catch (error) {
    console.error("❌ getOsCveData Error:", error);
    throw error;
  }
});

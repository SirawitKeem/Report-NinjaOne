import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { getOsPatchesNo } from './os_patches_no';
import { getDevicesData } from './device';

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

export const getCveDeviceMapping = cache(async function getCveDeviceMappingImpl() {
  try {
    const pendingPatches = await getOsPatchesNo();
    const devices = await getDevicesData();
    const cveCache = await loadCache();

    // Map deviceId -> displayName or systemName
    const deviceMap = new Map();
    devices.forEach(d => {
      deviceMap.set(d.id, d.displayName || d.systemName);
    });

    const cveMap = new Map();

    pendingPatches.forEach(patch => {
      const kb = patch.kbNumber;
      const deviceId = patch.deviceId;
      if (!kb || !deviceId) return;

      const deviceName = deviceMap.get(deviceId) || `Device #${deviceId}`;
      const msrcRecords = cveCache[kb] || [];

      msrcRecords.forEach(item => {
        const cveId = item.cveNumber;
        if (!cveId) return;

        // Extract CVSS score
        let baseScore = null;
        if (item.baseScore) {
          baseScore = parseFloat(item.baseScore);
        } else if (item.cvssScoreSets && item.cvssScoreSets.length > 0) {
          baseScore = parseFloat(item.cvssScoreSets[0].baseScore);
        }

        if (baseScore === null || isNaN(baseScore)) {
          const sev = (item.severity || "").toUpperCase();
          if (sev === "CRITICAL") baseScore = 9.0;
          else if (sev === "IMPORTANT") baseScore = 7.0;
          else if (sev === "MODERATE") baseScore = 4.0;
          else if (sev === "LOW") baseScore = 1.0;
          else baseScore = 0.0;
        }

        let level = "None";
        if (baseScore >= 9.0) level = "Critical";
        else if (baseScore >= 7.0) level = "High";
        else if (baseScore >= 4.0) level = "Medium";
        else if (baseScore > 0) level = "Low";

        if (!cveMap.has(cveId)) {
          cveMap.set(cveId, {
            CVE_ID: cveId,
            Severity: item.severity || "Unknown",
            CVSS_Base_Score: baseScore,
            CVSS_Level: level,
            Impact: item.impact || "Unknown",
            Product: item.product || "Unknown",
            devices: new Set()
          });
        }
        
        cveMap.get(cveId).devices.add(deviceName);
      });
    });

    // Convert Sets to Arrays and sort by CVSS score descending
    const result = Array.from(cveMap.values()).map(c => ({
      ...c,
      devices: Array.from(c.devices),
      deviceCount: c.devices.size
    })).sort((a, b) => b.CVSS_Base_Score - a.CVSS_Base_Score || b.deviceCount - a.deviceCount);

    return result;
  } catch (error) {
    console.error("❌ getCveDeviceMapping Error:", error);
    return [];
  }
});

export const getDeviceCveSummary = cache(async function getDeviceCveSummaryImpl() {
  try {
    const pendingPatches = await getOsPatchesNo();
    const devices = await getDevicesData();
    const cveCache = await loadCache();

    // Map deviceId -> device object template
    const deviceMap = new Map();
    devices.forEach(d => {
      deviceMap.set(d.id, {
        id: d.id,
        name: d.displayName || d.systemName,
        osGroup: d.osGroup || 'Windows',
        patchCount: 0,
        cveIds: new Set(),
        criticalCount: 0,
        highCount: 0
      });
    });

    // Populate patch counts and active CVEs per device
    pendingPatches.forEach(patch => {
      const deviceId = patch.deviceId;
      const kb = patch.kbNumber;
      if (!deviceId) return;

      let dev = deviceMap.get(deviceId);
      if (!dev) {
        dev = {
          id: deviceId,
          name: `Device #${deviceId}`,
          osGroup: 'Windows',
          patchCount: 0,
          cveIds: new Set(),
          criticalCount: 0,
          highCount: 0
        };
        deviceMap.set(deviceId, dev);
      }

      dev.patchCount += 1;

      if (kb && cveCache[kb]) {
        cveCache[kb].forEach(item => {
          const cveId = item.cveNumber;
          if (!cveId) return;

          dev.cveIds.add(cveId);

          // Extract CVSS score to classify severity
          let baseScore = null;
          if (item.baseScore) {
            baseScore = parseFloat(item.baseScore);
          } else if (item.cvssScoreSets && item.cvssScoreSets.length > 0) {
            baseScore = parseFloat(item.cvssScoreSets[0].baseScore);
          }

          if (baseScore === null || isNaN(baseScore)) {
            const sev = (item.severity || "").toUpperCase();
            if (sev === "CRITICAL") baseScore = 9.0;
            else if (sev === "IMPORTANT") baseScore = 7.0;
            else baseScore = 0.0;
          }

          if (baseScore >= 9.0) {
            dev.criticalCount += 1;
          } else if (baseScore >= 7.0) {
            dev.highCount += 1;
          }
        });
      }
    });

    const result = Array.from(deviceMap.values())
      .map(d => ({
        id: d.id,
        name: d.name,
        osGroup: d.osGroup,
        patchCount: d.patchCount,
        cveCount: d.cveIds.size,
        criticalCount: d.criticalCount,
        highCount: d.highCount,
        cves: Array.from(d.cveIds)
      }))
      .filter(d => d.patchCount > 0) // Only display active vulnerable devices
      .sort((a, b) => b.cveCount - a.cveCount || b.patchCount - a.patchCount);

    return result;
  } catch (error) {
    console.error("❌ getDeviceCveSummary Error:", error);
    return [];
  }
});



import { fetchFromNinja } from './ninjaClient';

async function fetchAllPages(endpoint) {
  let allResults = [];
  let currentPath = endpoint;

  while (currentPath) {
    const response = await fetchFromNinja(currentPath);

    if (response.results && response.results.length > 0) {
      allResults = allResults.concat(response.results);
    }

    let nextUrl = null;
    if (response.next) nextUrl = response.next;
    else if (response.nextPage) nextUrl = response.nextPage;
    else if (response.links && response.links.next) nextUrl = response.links.next;

    if (nextUrl) {
      currentPath = nextUrl.replace("https://oc.ninjarmm.com", "");
    } else {
      currentPath = null;
    }
  }

  return allResults;
}

// แปลง timestamp (Unix seconds → JS Date)
function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  return new Date(num * 1000);
}

// mapping status จาก API → softwareStatus
export function mapStatus(status) {
  const val = String(status || "").toUpperCase();
  if (val === "INSTALLED") return "Installed";
  if (val === "APPROVED") return "Approved";
  if (val === "REJECTED") return "Rejected";
  if (val === "MANUAL" || val === "FAILED") return "Pending"; 
  return "Pending";
}

// ---- Software Patches ----
export async function getSoftwarePatches() {
  try {
    const rawData = await fetchAllPages("/v2/queries/software-patches");

    const transformedData = rawData.map(item => ({
      patchId:           item.id                ?? null,
      productIdentifier: item.productIdentifier ?? null,
      softwareName:      item.title             ?? null,
      impact:            item.impact            ?? null,
      status:            item.status            ?? null,
      installType:       item.type              ?? null,
      deviceId:          item.deviceId          ?? null,
      scanTimestamp:     toDate(item.timestamp),
      installedAt:       toDate(item.installedAt),
      softwareStatus:    mapStatus(item.status),
    }));

    return transformedData;
  } catch (error) {
    console.error("❌ Fetch Software Patches Error:", error);
    throw error;
  }
}

// ---- Software Patch Installs ----
export async function getSoftwarePatchInstalls() {
  try {
    const rawData = await fetchAllPages("/v2/queries/software-patch-installs");

    // 🔍 ดู impact จริงจาก endpoint นี้
    const uniqueImpact = [...new Set(rawData.map(i => i.impact))];
    const uniqueStatus = [...new Set(rawData.map(i => i.status))];

    const transformedData = rawData.map(item => ({
      patchId:           item.id                ?? null,
      productIdentifier: item.productIdentifier ?? null,
      softwareName:      item.title             ?? null,
      impact:            item.impact            ?? null,
      status:            item.status            ?? null,
      installType:       item.type              ?? null,
      deviceId:          item.deviceId          ?? null,
      scanTimestamp:     toDate(item.timestamp),
      installedAt:       toDate(item.installedAt),
      softwareStatus:    mapStatus(item.status),
    }));

    return transformedData;
  } catch (error) {
    console.error("❌ Fetch Software Patch Installs Error:", error);
    throw error;
  }
}

// ---- Combined ----
export async function getAllSoftwareData() {
  try {
    const [patches, installs] = await Promise.all([
      getSoftwarePatches(),
      getSoftwarePatchInstalls(),
    ]);

    return [...patches, ...installs];
  } catch (error) {
    console.error("❌ Fetch All Software Data Error:", error);
    throw error;
  }
}
import { fetchFromNinja } from './ninjaClient';

async function fetchAllPatchPages(endpoint) {
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
      try {
        const parsed = new URL(nextUrl);
        if (parsed.origin !== 'https://oc.ninjarmm.com') {
          console.error('[os_patches_no] Unexpected pagination origin, stopping:', parsed.origin);
          break;
        }
        currentPath = parsed.pathname + parsed.search;
      } catch {
        currentPath = null;
      }
    } else {
      currentPath = null;
    }
  }

  return allResults;
}

export async function getOsPatchesNo() {
  try {
    const rawData = await fetchAllPatchPages("/v2/queries/os-patches");

    const transformedData = rawData
      .filter(item => item.status !== "INSTALLED") // กรองเฉพาะตัวที่ยังไม่ Install
      .map(item => ({
        id: item.id,
        name: item.name,
        severity: item.severity,
        status: item.status,
        type: item.type,
        deviceId: item.deviceId,
        kbNumber: item.kbNumber || null,
        installedAt: item.installedAt ? new Date(item.installedAt * 1000) : null,
        timestamp: item.timestamp ? new Date(item.timestamp * 1000) : null,
      }));

    return transformedData;
  } catch (error) {
    console.error("Fetch OS Patches Error:", error);
    throw error;
  }
}
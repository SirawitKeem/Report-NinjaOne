import { fetchFromNinja } from './ninjaClient';

// ฟังก์ชันช่วยดึงข้อมูลทุกหน้า (Pagination)
async function fetchAllPatchPages(endpoint) {
  let allResults = [];
  let currentPath = endpoint;

  while (currentPath) {
    // ดึงข้อมูลผ่าน ninjaClient
    const response = await fetchFromNinja(currentPath);
    
    if (response.results && response.results.length > 0) {
      allResults = allResults.concat(response.results);
    }

    // เช็คหน้าถัดไป (ตัด Domain ทิ้งให้เหลือแค่ Path แบบที่ Power Query ทำ)
    let nextUrl = null;
    if (response.next) nextUrl = response.next;
    else if (response.nextPage) nextUrl = response.nextPage;
    else if (response.links && response.links.next) nextUrl = response.links.next;

    if (nextUrl) {
      try {
        const parsed = new URL(nextUrl);
        if (parsed.origin !== 'https://oc.ninjarmm.com') {
          console.error('[os_patch_installs] Unexpected pagination origin, stopping:', parsed.origin);
          break;
        }
        currentPath = parsed.pathname + parsed.search;
      } catch {
        currentPath = null; // ถ้า parse URL ไม่ได้ ให้หยุด Loop
      }
    } else {
      currentPath = null;
    }
  }

  return allResults;
}

export async function getOsPatchInstalls() {
  try {
    const rawData = await fetchAllPatchPages("/v2/queries/os-patch-installs");

    
    // แปลงข้อมูลและกรองเฉพาะ INSTALLED
    const transformedData = rawData
      .filter(item => item.status === "INSTALLED") // กรอง status
      .map(item => ({
        id: item.id,
        name: item.name,
        severity: item.severity,
        status: item.status,
        type: item.type,
        deviceId: item.deviceId,
        kbNumber: item.kbNumber || null, // ถ้าไม่มีให้เป็น null
        // NinjaOne timestamp มักมาเป็นวินาที ใน JS ต้องคูณ 1000 ให้เป็นมิลลิวินาที
        InstalledDate: item.timestamp ? new Date(item.timestamp * 1000) : null 
      }));

    return transformedData;
  } catch (error) {
    console.error("Fetch OS Patch Installs Error:", error);
    throw error;
  }
}
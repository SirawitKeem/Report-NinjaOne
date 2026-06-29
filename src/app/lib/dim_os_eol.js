// OS_EOL_API_URL must be set in .env — no hardcoded IP fallback for security
const BASE_URL = process.env.OS_EOL_API_URL;
if (!BASE_URL) {
  console.warn('[dim_os_eol] WARNING: OS_EOL_API_URL is not set. OS EOL data will be unavailable. Please set this in your .env file.');
}

export async function getOsEolData() {
  if (!BASE_URL) {
    console.error('[dim_os_eol] OS_EOL_API_URL not configured. Returning empty dataset.');
    return [];
  }
  try {
    // 1. ดึงข้อมูลหน้าแรก (เพื่อหา Total Pages)
    const firstRes = await fetch(`${BASE_URL}/data?page=1&page_size=20`);
    if (!firstRes.ok) throw new Error(`Failed to fetch OS EOL data (Page 1): HTTP ${firstRes.status}`);
    
    const firstPageData = await firstRes.json();
    const totalPages = firstPageData.total_pages || 1;
    
    // เก็บข้อมูลหน้าแรกไว้ใน Array ก่อน
    let allData = [...(firstPageData.data || [])];

    // ==========================================
    // 2. วนลูปดึงหน้าที่เหลือ (Page 2 ถึง Total Pages)
    // ==========================================
    if (totalPages > 1) {
      const fetchPromises = [];
      // สร้าง Promise สำหรับดึงหน้า 2 เป็นต้นไปพร้อมๆ กันเพื่อความเร็ว
      for (let p = 2; p <= totalPages; p++) {
        fetchPromises.push(
          fetch(`${BASE_URL}/data?page=${p}&page_size=20`).then(res => {
            if (!res.ok) throw new Error(`OS EOL page ${p} failed: HTTP ${res.status}`);
            return res.json();
          })
        );
      }

      // รอจนกว่าจะดึงครบทุกหน้า แล้วเอาข้อมูลมารวมกัน (List.Combine)
      const remainingPages = await Promise.all(fetchPromises);
      remainingPages.forEach(page => {
        if (page.data) {
          allData = allData.concat(page.data);
        }
      });
    }


    let transformedData = allData.map(item => {
    
      const osGroup = item.product ? String(item.product).trim() : "";
      const cycle = item.cycle ? String(item.cycle).trim() : "";
      let matchKey = null;
      if (osGroup !== "" && cycle !== "") {
        matchKey = `${osGroup.toLowerCase()}-${cycle.toLowerCase()}`;
      }


      let fullName = matchKey;
      if (matchKey) {
        const parts = matchKey.split("-");
        const version = parts.length > 1 ? parts[1] : null;
        const release = parts.length > 2 ? parts[2] : null;
        const edition = parts.length > 3 ? parts[3] : null;

        let editionName = null;
        if (edition === "w") editionName = "Pro";
        else if (edition === "e") editionName = "Enterprise/Education";

    
        if (matchKey.startsWith("windows-") && editionName !== null) {
          fullName = `Windows ${version} ${editionName} ${release.toUpperCase()}`;
        } else if (matchKey.startsWith("windows-server-")) {
          fullName = `Windows Server ${matchKey.replace("windows-server-", "")}`;
        }
      }

      return {
        OS_Group: osGroup,
        Cycle: cycle,
        EOL_Date: item.eol ? new Date(item.eol) : null,
        Support_Date: item.support ? new Date(item.support) : null,
        API_Link: item.link || "",
        Match_Key: matchKey,
        "Full Name": fullName
      };
    });

    transformedData = transformedData.filter(row => row.OS_Group === "windows");

    return transformedData;

  } catch (error) {
    console.error("OS EOL API Error:", error);
    throw error;
  }
}
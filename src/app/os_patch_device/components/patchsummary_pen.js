import React from 'react';
import Summary from '../../Components/Summary';
import { getPatchPendingSummaryData } from '../datasummary_pen'; // ดึงจากไฟล์ใหม่ที่สร้างขึ้น
import { getDevicesData } from '../../lib/device';
import { getOsPatchesNo } from '../../lib/os_patches_no';



export default async function PatchSummaryPending() {
  try {
    // 1. ดึงข้อมูลแค่ 2 เส้น เพราะเราสนใจแค่เครื่องที่มี Pending
    const [devices, pendingPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchesNo()
    ]);

    // 2. Build Map : deviceId (string) → osGroup
    const deviceOsMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceOsMap[String(d.id)] = d.osGroup;
      }
    });

    // 3. รวบรวม deviceId ที่มี Pending patch อยู่ (ใช้ Set เพื่อไม่ให้นับเครื่องซ้ำกรณีมีหลายแพตช์ค้าง)
    const devicesWithPending = new Set(
      pendingPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    // 4. เตรียมตัวแปรนับจำนวน
    let totalCount      = 0;
    let windowsCount    = 0;
    let windowsSrvCount = 0;
    let macOSCount      = 0;
    let linuxCount      = 0;

    // 5. วนลูปนับแยกตาม osGroup โดยอิงจากเครื่องที่ติด Pending เท่านั้น
    devicesWithPending.forEach(id => {
      totalCount++; // นับยอดรวมเสมอ
      
      const osGroup = deviceOsMap[id];
      if (osGroup === "windows")         windowsCount++;
      else if (osGroup === "windowsSrv") windowsSrvCount++;
      else if (osGroup === "macOS")      macOSCount++;
      else if (osGroup === "linux")      linuxCount++;
    });

    // 6. เตรียม Data object เพื่อส่งไปจัดรูปแบบ
    const counts = {
      total:      totalCount,
      windows:    windowsCount,
      windowsSrv: windowsSrvCount,
      macOS:      macOSCount,
      linux:      linuxCount,
    };

    const { mainStats } = getPatchPendingSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1 mt-3">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Pending Patches Summary:", error);
    return <div className="p-4 text-red-500">Failed to load pending patch summary data.</div>;
  }
}
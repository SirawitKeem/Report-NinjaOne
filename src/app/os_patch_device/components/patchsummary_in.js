import React from 'react';
import Summary from '../../Components/Summary';
import { getPatchInstalledSummaryData } from '../datahsummary_in';
import { getDevicesData } from '../../lib/device';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { getOsPatchesNo } from '../../lib/os_patches_no';

export default async function PatchSummaryInstalled() {
  try {
    // 1. ดึงข้อมูล 3 เส้นพร้อมกัน
    const [devices, installedPatches, pendingPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchInstalls(),
      getOsPatchesNo()
    ]);

    // 2. Build Map : deviceId (string) → osGroup
    const deviceOsMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceOsMap[String(d.id)] = d.osGroup;
      }
    });

    // 3. รวบรวม deviceId ที่ยังมี Pending patch อยู่
    const devicesWithPending = new Set(
      pendingPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    // 4. รวบรวม deviceId ที่มี patch INSTALLED อย่างน้อย 1 ตัว
    const devicesWithInstalled = new Set(
      installedPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    // 5. Device "เรียบร้อย" = มี installed + ไม่มี pending เหลืออยู่เลย
    const cleanDeviceIds = [...devicesWithInstalled].filter(
      id => !devicesWithPending.has(id)
    );

    // 6. นับแยกตาม osGroup
    let totalCount      = 0;
    let windowsCount    = 0;
    let windowsSrvCount = 0;
    let macOSCount      = 0;
    let linuxCount      = 0;

    cleanDeviceIds.forEach(id => {
      const osGroup = deviceOsMap[id];

      totalCount++; // ✅ นับเข้า total ทุกเครื่อง ไม่ว่าจะรู้ osGroup หรือเปล่า

      if (osGroup === "windows")         windowsCount++;
      else if (osGroup === "windowsSrv") windowsSrvCount++;
      else if (osGroup === "macOS")      macOSCount++;
      else if (osGroup === "linux")      linuxCount++;
      // osGroup === "other" หรือ undefined → นับใน total แต่ไม่นับในกลุ่มใด
    });

    // 7. ส่งตัวเลขให้ Summary Component
    const counts = {
      total:      totalCount,
      windows:    windowsCount,
      windowsSrv: windowsSrvCount,
      macOS:      macOSCount,
      linux:      linuxCount,
    };

    const { mainStats } = getPatchInstalledSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading Installed Patches Summary:", error);
    return <div className="p-4 text-red-500">Failed to load patch summary data.</div>;
  }
}
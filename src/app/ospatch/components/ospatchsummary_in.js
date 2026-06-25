import React from 'react';
import Summary from '../../Components/Summary';
import { getOsPatchInstalledSummaryData } from '../datahsummary_in'; 
import { getDevicesData } from '../../lib/device';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';

export default async function OSPatchSummaryInstalled() {
  try {
    const [devices, installedPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchInstalls()
    ]);

    const deviceOsMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceOsMap[String(d.id)] = d.osGroup;
      }
    });

    // 3. เตรียมตัวแปรนับจำนวนแพตช์ (Patch Count)
    let totalCount      = 0;
    let windowsCount    = 0;
    let windowsSrvCount = 0;
    let macOSCount      = 0;
    let linuxCount      = 0;

    // 4. วนลูปนับ "จำนวนแพตช์" ไม่ใช่จำนวนเครื่อง
    installedPatches.forEach(patch => {
      totalCount++; // นับแพตช์ทุกๆ ตัวที่เจอ

      const deviceId = String(patch.deviceId ?? "");
      const osGroup = deviceOsMap[deviceId];

      // แยกจำนวนแพตช์ตาม OS ของเครื่องนั้นๆ
      if (osGroup === "windows")         windowsCount++;
      else if (osGroup === "windowsSrv") windowsSrvCount++;
      else if (osGroup === "macOS")      macOSCount++;
      else if (osGroup === "linux")      linuxCount++;
    });

    // 5. เตรียม Data object เพื่อส่งให้ Summary
    const counts = {
      total:      totalCount,
      windows:    windowsCount,
      windowsSrv: windowsSrvCount,
      macOS:      macOSCount,
      linux:      linuxCount,
    };

    const { mainStats } = getOsPatchInstalledSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading OS Patch Installed Summary:", error);
    return <div className="p-4 text-red-500">Failed to load OS patch summary data.</div>;
  }
}
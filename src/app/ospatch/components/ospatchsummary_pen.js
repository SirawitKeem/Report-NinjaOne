import React from 'react';
import Summary from '../../Components/Summary';
import { getOsPatchPendingSummaryData } from '../datahsummary_pen';
import { getDevicesData } from '../../lib/device';
import { getOsPatchesNo } from '../../lib/os_patches_no';

export default async function OSPatchSummaryPending() {
  try {
    const [devices, pendingPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchesNo()
    ]);

    // Build Map : deviceId (string) → osGroup
    const deviceOsMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceOsMap[String(d.id)] = d.osGroup;
      }
    });

    let totalCount      = 0;
    let windowsCount    = 0;
    let windowsSrvCount = 0;
    let macOSCount      = 0;
    let linuxCount      = 0;

    // วนลูปนับจำนวน "แพตช์ที่ยังไม่ติดตั้ง (Pending)"
    pendingPatches.forEach(patch => {
      totalCount++; 

      const deviceId = String(patch.deviceId ?? "");
      const osGroup = deviceOsMap[deviceId];

      if (osGroup === "windows")         windowsCount++;
      else if (osGroup === "windowsSrv") windowsSrvCount++;
      else if (osGroup === "macOS")      macOSCount++;
      else if (osGroup === "linux")      linuxCount++;
    });

    const counts = {
      total:      totalCount,
      windows:    windowsCount,
      windowsSrv: windowsSrvCount,
      macOS:      macOSCount,
      linux:      linuxCount,
    };

    const { mainStats } = getOsPatchPendingSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1 mt-3">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("Error loading OS Patch Pending Summary:", error);
    return <div className="p-4 text-red-500">Failed to load OS pending patch summary.</div>;
  }
}
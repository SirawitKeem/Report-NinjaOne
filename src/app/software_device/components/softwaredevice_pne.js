import React from 'react';
import Summary from '../../Components/Summary';
import { getSoftwarePendingSummaryData } from '../datasoftware_pen';
import { getDevicesData } from '../../lib/device';
import { getAllSoftwareData } from '../../lib/software';

export default async function SoftwareDevicePending() {
  try {
    // 1. ดึงข้อมูลพร้อมกัน
    const [devices, softwareData] = await Promise.all([
      getDevicesData(),
      getAllSoftwareData(),
    ]);

    // 2. Build Map : deviceId → osGroup
    const deviceOsMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceOsMap[String(d.id)] = d.osGroup;
      }
    });

    // 3. รวบรวม deviceId ที่มี Software Pending อย่างน้อย 1 ตัว (unique)
    const devicesWithPending = new Set(
      softwareData
        .filter(s => s.softwareStatus === "Pending")
        .map(s => String(s.deviceId ?? ""))
        .filter(Boolean)
    );

    // 4. นับแยกตาม osGroup
    let totalCount      = 0;
    let windowsCount    = 0;
    let windowsSrvCount = 0;
    let macOSCount      = 0;
    let linuxCount      = 0;
    let otherCount      = 0;

    [...devicesWithPending].forEach(id => {
      const osGroup = deviceOsMap[id];
      totalCount++;
      if      (osGroup === "windows")     windowsCount++;
      else if (osGroup === "windowsSrv")  windowsSrvCount++;
      else if (osGroup === "macOS")       macOSCount++;
      else if (osGroup === "linux")       linuxCount++;
      else                                otherCount++;
    });

    const counts = {
      total:      totalCount,
      windows:    windowsCount,
      windowsSrv: windowsSrvCount,
      macOS:      macOSCount,
      linux:      linuxCount,
    };


    const { mainStats } = getSoftwarePendingSummaryData(counts);

    return (
      <div className="w-full pt-2.5 pb-1 mt-3">
        <Summary mainStats={mainStats} />
      </div>
    );

  } catch (error) {
    console.error("❌ SOFTWAREDEVICE_PEN Error:", error);
    return <div className="p-4 text-red-500">Failed to load software pending device summary.</div>;
  }
}
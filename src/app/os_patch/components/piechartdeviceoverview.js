import React from 'react';
import PieChart from '../../Components/PieChart';
import { getDevicesData } from '../../lib/device';
import { getOsPatchesNo } from '../../lib/os_patches_no';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';

const PieIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

export default async function DevicePieChartOverview() {
  try {
    // 1. ดึงข้อมูล 3 เส้นพร้อมกัน
    const [devices, uninstalledPatches, installedPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchesNo(),
      getOsPatchInstalls()
    ]);

    // 2. Build Set: deviceId ที่มี pending patch อยู่
    const pendingDeviceIds = new Set();
    uninstalledPatches.forEach(patch => {
      const id = String(patch.deviceId || "");
      if (!id) return;
      pendingDeviceIds.add(id);
    });

    // 3. Build Set: deviceId ที่มี installed record อย่างน้อย 1 ตัว
    const devicesWithInstalled = new Set(
      installedPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    // 4. แบ่ง 3 กลุ่ม ให้ตรงกับ devicesummary.js
    const allDeviceIds = new Set(devices.map(d => String(d.id)));

    let healthyCount     = 0;
    let noPatchDataCount = 0;

    allDeviceIds.forEach(id => {
      const hasInstalled = devicesWithInstalled.has(id);
      const hasPending   = pendingDeviceIds.has(id);

      if (hasInstalled && !hasPending) {
        // ✅ Installed Complete: patch ครบ ไม่มีค้าง
        healthyCount++;
      } else if (!hasInstalled && !hasPending) {
        // ❓ No Patch Data: NinjaOne ไม่รู้สถานะ
        noPatchDataCount++;
      }
    });

    // 5. Pie Chart แสดง 3 กลุ่ม
    const chartData = [
      {
        id: 1,
        label: "Installed Complete",
        value: healthyCount,
        color: "bg-green-500",
        stroke: "text-green-500",
      },
      {
        id: 2,
        label: "Pending Devices",
        value: pendingDeviceIds.size,
        color: "bg-orange-500",
        stroke: "text-orange-500",
      },
      {
        id: 3,
        label: "No Patch Data",
        value: noPatchDataCount,
        color: "bg-gray-400",
        stroke: "text-gray-400",
      },
    ];


    return (
      <div className="w-full h-[320px] pr-10 mt-4">
        <PieChart
          title="Device Patch Overview"
          icon={PieIcon}
          data={chartData}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Device Pie Chart:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
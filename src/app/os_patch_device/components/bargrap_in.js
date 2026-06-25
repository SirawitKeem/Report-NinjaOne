import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getDevicesData } from '../../lib/device';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { getOsPatchesNo } from '../../lib/os_patches_no';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../barColors'; 



export default async function PatchInstalledBarGraph_Devices() {
  try {
    const [devices, installedPatches, pendingPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchInstalls(),
      getOsPatchesNo() 
    ]);

    const deviceNameMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceNameMap[String(d.id)] = d.systemName || `Device ${d.id}`;
      }
    });

    const devicesWithPending = new Set(
      pendingPatches
        .map(p => String(p.deviceId ?? ""))
        .filter(Boolean)
    );

    const patchCountMap = {};
    installedPatches.forEach(patch => {
      const id = String(patch.deviceId ?? "");
      if (!id) return;

      if (!devicesWithPending.has(id)) {
        patchCountMap[id] = (patchCountMap[id] || 0) + 1;
      }
    });

    const top10 = Object.entries(patchCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count], index) => ({
        id: index + 1,
        label: deviceNameMap[id] || `Device ${id}`,
        value: count,
        color: barColors[index] || "bg-blue-500", 
      }));

    return (
      // นำ h-[340px] ออกแล้ว เพื่อให้ความสูงขึ้นอยู่กับภายใน Component BarGraph เท่านั้น
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Fully Patched Devices (By Installed Count)"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Installed Patch Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
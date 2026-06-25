import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getDevicesData } from '../../lib/device';
import { getOsPatchesNo } from '../../lib/os_patches_no';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../barColors'; 

export default async function PatchPendingBarGraph_Devices() {
  try {
    // 1. ดึงข้อมูล Devices และข้อมูล Pending Patches
    const [devices, pendingPatches] = await Promise.all([
      getDevicesData(),
      getOsPatchesNo()
    ]);

    // 2. Build Map: deviceId → systemName
    const deviceNameMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceNameMap[String(d.id)] = d.systemName || `Device ${d.id}`;
      }
    });

    // 3. นับจำนวน Pending patch ต่อเครื่อง
    const pendingCountMap = {};
    pendingPatches.forEach(patch => {
      const id = String(patch.deviceId ?? "");
      if (!id) return;
      
      // นับเพิ่มเข้าไปในเครื่องนั้นๆ ทันทีที่เจอแพตช์ค้าง
      pendingCountMap[id] = (pendingCountMap[id] || 0) + 1;
    });

    // 4. เรียงลำดับจากค้างเยอะสุดไปน้อยสุด และตัดเอาแค่ Top 10
    const top10 = Object.entries(pendingCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count], index) => ({
        id: index + 1,
        label: deviceNameMap[id] || `Device ${id}`,
        value: count,
        // ดึงชุดสีมาใช้เหมือนเดิม ถ้าไม่มีให้ fallback เป็นสีส้ม (บ่งบอกถึงสถานะ Pending)
        color: barColors[index] || "bg-orange-500", 
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Devices with Pending Patches"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Pending Patch Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
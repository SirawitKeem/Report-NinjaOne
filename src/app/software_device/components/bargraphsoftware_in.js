import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getDevicesData } from '../../lib/device';
import { getAllSoftwareData } from '../../lib/software';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../../Components/barColors';

export default async function BargraphSoftwareInstalled() {
  try {
    // 1. ดึงข้อมูลพร้อมกัน
    const [devices, softwareData] = await Promise.all([
      getDevicesData(),
      getAllSoftwareData(),
    ]);

    // 2. Build Map : deviceId → systemName
    const deviceNameMap = {};
    devices.forEach(d => {
      if (d.id != null) {
        deviceNameMap[String(d.id)] = d.systemName || `Device ${d.id}`;
      }
    });

    // 3. นับจำนวน Software Installed ต่อ device
    const countMap = {};
    softwareData
      .filter(s => s.softwareStatus === "Installed")
      .forEach(s => {
        const id = String(s.deviceId ?? "");
        if (!id) return;
        countMap[id] = (countMap[id] || 0) + 1;
      });


    // 4. Sort descending → Top 10 เครื่องที่ติดตั้ง Software มากสุด
    const top10 = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count], index) => ({
        id:    index + 1,
        label: deviceNameMap[id] || `Device ${id}`,
        value: count,
        color: barColors[index] || "bg-green-500",
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Devices - Most Software Installed"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("❌ BARGRAPH_SW_IN Error:", error);
    return <div className="p-4 text-red-500">Failed to load software installed chart data.</div>;
  }
}
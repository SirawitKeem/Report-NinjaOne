import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getAllSoftwareData } from '../../lib/software';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../../Components/barColors';

export default async function SoftwarePendingBarGraph() {
  try {
    const softwareData = await getAllSoftwareData();

    // นับจำนวน Pending ต่อ softwareName
    const countMap = {};
    softwareData
      .filter(s => s.softwareStatus === "Pending")
      .forEach(s => {
        const name = s.softwareName || "Unknown";
        countMap[name] = (countMap[name] || 0) + 1;
      });

    // Top 10 software ที่รอ update มากสุด
    const top10 = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count], index) => ({
        id: index + 1,
        label: name,
        value: count,
        color: barColors[index] || "bg-orange-500",
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Software Pending Update (Most Pending)"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("❌ BARGRAPH_SW_PEN Error:", error);
    return <div className="p-4 text-red-500">Failed to load software pending chart data.</div>;
  }
}
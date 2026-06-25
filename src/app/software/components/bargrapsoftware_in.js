import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getAllSoftwareData } from '../../lib/software';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../../Components/barColors';

export default async function SoftwareInstalledBarGraph() {
  try {
    const softwareData = await getAllSoftwareData();

    const countMap = {};
    softwareData
      .filter(s => s.softwareStatus === "Installed")
      .forEach(s => {
        const name = s.softwareName || "Unknown";
        countMap[name] = (countMap[name] || 0) + 1;
      });

    const top10 = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count], index) => ({
        id: index + 1,
        label: name,
        value: count,
        color: barColors[index] || "bg-green-500",
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Software Installed (Most Installed)"
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
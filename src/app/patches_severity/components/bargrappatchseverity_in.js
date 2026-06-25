import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { BarChart2 } from 'lucide-react';
import { getSeverityInstalledSummaryData, countBySeverity } from '../dataseverity_in'; // ✅ ดึงฟังก์ชันจัดการสีกลับมาใช้

export default async function PatchSeverityInstalledBarGraph() {
  try {
    const installedPatches = await getOsPatchInstalls();
    const counts = countBySeverity(installedPatches);
    const { mainStats } = getSeverityInstalledSummaryData(counts);
    const severityData = mainStats
      .filter(item => item.id !== 1) 
      .map(item => ({
        id: item.id,
        label: item.label,
        value: item.value,
        color: item.barColor,
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="OS Patch Installed by Severity"
          icon={BarChart2}
          data={severityData}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Severity Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
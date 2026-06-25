import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { BarChart2 } from 'lucide-react';
import { barColors } from '../../Components/barColors'; 

export default async function TopOsPatchInstalledBarGraph() {
  try {
    const installedPatches = await getOsPatchInstalls();

    const patchFrequencyMap = {};
    installedPatches.forEach(patch => {

      const patchName = patch.title || patch.name || `Patch ID: ${patch.id || 'Unknown'}`;

      if (!patchName || patchName === 'Unknown') return;
      patchFrequencyMap[patchName] = (patchFrequencyMap[patchName] || 0) + 1;
    });

    const top10 = Object.entries(patchFrequencyMap)
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
          title="Top 10 Most Installed by Patches"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Top OS Patch Installed Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
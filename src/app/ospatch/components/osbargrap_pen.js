import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getOsPatchesNo } from '../../lib/os_patches_no'; 
import { BarChart2 } from 'lucide-react';
import { barColors } from '../../Components/barColors'; 

export default async function TopOsPatchPendingBarGraph() {
  try {
    // 1. ดึงข้อมูลเฉพาะแพตช์ที่ยังไม่ได้ติดตั้ง (Pending)
    const pendingPatches = await getOsPatchesNo();

    // 2. นับจำนวนครั้งที่แต่ละแพตช์ค้างอยู่ในระบบ
    const patchFrequencyMap = {};
    pendingPatches.forEach(patch => {
      const patchName = patch.title || patch.name || `Patch ID: ${patch.id || 'Unknown'}`;

      if (!patchName || patchName === 'Unknown') return;

      patchFrequencyMap[patchName] = (patchFrequencyMap[patchName] || 0) + 1;
    });

    // 3. เรียงลำดับหา Top 10 แพตช์ที่ค้างเยอะที่สุด
    const top10 = Object.entries(patchFrequencyMap)
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, 10)
      .map(([name, count], index) => ({
        id: index + 1,
        label: name,
        value: count, 
        // ใช้ชุดสีเดิม ถ้าหมดให้ใช้สีส้มเพื่อสื่อถึง Pending
        color: barColors[index] || "bg-orange-500", 
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="Top 10 Most Pending by Patches"
          icon={BarChart2}
          data={top10}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Top OS Patch Pending Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
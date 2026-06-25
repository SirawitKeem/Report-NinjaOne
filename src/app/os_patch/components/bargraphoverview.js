import React from 'react';
import BarGraph from '../../Components/BarGraph'; // เรียกใช้ BarGraph ตัวแม่ของคุณ
import { patchStatusColors } from '../databarColors'; // ดึงชุดสีมาใช้

// ดึง API
import { getOsPatchInstalls } from '../../lib/os_patch_installs';
import { getOsPatchesNo } from '../../lib/os_patches_no';

// Icon รูปกล่องแพ็คเกจ
const StatusIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default async function PatchOverviewBarGraph() {
  try {
    // 1. ดึงข้อมูลจาก API ทั้ง 2 เส้นพร้อมกัน
    const [installedPatches, uninstalledPatches] = await Promise.all([
      getOsPatchInstalls(),
      getOsPatchesNo()
    ]);

    // 2. คำนวณนับจำนวนแยกตามสถานะ
    const counts = {
      "Installed": installedPatches.length,
      "Manual": uninstalledPatches.filter(p => p.status === "MANUAL").length,
      "Approved": uninstalledPatches.filter(p => p.status === "APPROVED").length,
      "Rejected": uninstalledPatches.filter(p => p.status === "REJECTED").length,
    };

    // 3. แปลงเป็น Array และจัดเรียงจากมากไปน้อย
    const sortedStatuses = Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    // 4. สวมสีให้ตรงกับสถานะ 
    const finalGraphData = sortedStatuses.map((item, index) => ({
      id: index + 1,
      label: item.label,
      value: item.value,
      color: patchStatusColors[item.label] || "bg-gray-400" 
    }));

    return (
      // จุดสำคัญที่แก้: เพิ่ม h-[350px] (หรือความสูงที่คุณต้องการ) 
      // เพื่อให้ h-full ใน BarGraph.js ยืดออกมากางได้เต็มกล่องพอดี
      <div className="w-full h-[320px] pr-10 mt-4">
        <BarGraph
          title="OS Patch Status Overview"
          icon={StatusIcon}
          data={finalGraphData} // โยนข้อมูลที่เรียบร้อยแล้วเข้า Component หลัก
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Overview Graph:", error);
    return <div className="p-4 text-red-500">Failed to load graph data.</div>;
  }
}
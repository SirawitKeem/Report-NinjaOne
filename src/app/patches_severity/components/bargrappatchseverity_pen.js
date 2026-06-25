import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { getOsPatchesNo } from '../../lib/os_patches_no'; // ✅ เปลี่ยนมาดึงจาก os_patches_no
import { BarChart2 } from 'lucide-react';
import { getSeverityPendingSummaryData, countBySeverity } from '../dataseverity_pen'; // ✅ เรียกใช้จากไฟล์ _pen

export default async function PatchSeverityPendingBarGraph() {
  try {
    // 1. ดึงข้อมูล Patch ที่ยังไม่ได้ติดตั้ง (Pending/Missing)
    const pendingPatches = await getOsPatchesNo();

    // 2. นับจำนวนแยกตามความรุนแรง
    const counts = countBySeverity(pendingPatches);
    
    // 3. ดึงข้อมูลสเปกสีและ label มาจาก dataseverity_pen.js
    const { mainStats } = getSeverityPendingSummaryData(counts);

    // 4. แปลงข้อมูลส่งให้กราฟ โดยใช้สีตรงตามที่กำหนดไว้ใน mainStats
    const severityData = mainStats
      .filter(item => item.id !== 1) // ✅ กรองเอา "Total Pending" ออก ให้เหลือแค่แท่งกราฟของแต่ละ Severity
      .map(item => ({
        id: item.id,
        label: item.label,
        value: item.value,
        color: item.barColor, // ✅ ดึงคลาสสี (เช่น bg-red-600, bg-purple-600) ไปใช้ตรงๆ ตามที่เซ็ตไว้
      }));

    return (
      <div className="w-full h-[350px] pr-10 mt-4">
        <BarGraph
          title="OS Patch Pending by Severity" // ✅ เปลี่ยน Title ของกราฟให้ชัดเจนว่าคือ Pending
          icon={BarChart2}
          data={severityData}
        />
      </div>
    );

  } catch (error) {
    console.error("Error loading Patch Severity Pending Bar Graph:", error);
    return <div className="p-4 text-red-500">Failed to load chart data.</div>;
  }
}
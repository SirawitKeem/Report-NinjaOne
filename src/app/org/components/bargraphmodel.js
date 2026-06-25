import React from 'react';
import BarGraph from '../../Components/BarGraph'; 
import { barColors } from '../databargraphos'; 

// นำเข้า API
import { getDevicesData } from '../../lib/device';

// Icon รูป Server/Hardware สำหรับแสดงผลเรื่อง Model
const ServerIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

export default async function OrgSummaryModelBarGraph() {
  // 1. ดึงข้อมูล Devices ทั้งหมดจาก API
  const devices = await getDevicesData();

  // ==========================================
  // ขั้นตอนที่ A: หาว่า Organization ไหนคือ "อันดับ 1" (โลจิกเดียวกับ Header และ OS)
  // ==========================================
  const deviceCountsByOrg = {};
  devices.forEach(device => {
    const orgId = device.organizationId;
    if (orgId) {
      deviceCountsByOrg[orgId] = (deviceCountsByOrg[orgId] || 0) + 1;
    }
  });

  let topOrgId = null;
  let maxCount = 0;
  for (const [orgId, count] of Object.entries(deviceCountsByOrg)) {
    if (count > maxCount) {
      maxCount = count;
      topOrgId = orgId;
    }
  }

  // ==========================================
  // ขั้นตอนที่ B: กรองข้อมูล และนับ Model (เฉพาะของบริษัทอันดับ 1)
  // ==========================================
  
  // กรองเอาเฉพาะ Device ที่ organizationId ตรงกับแชมป์ของเรา
  const filteredDevices = devices.filter(d => String(d.organizationId) === String(topOrgId));

  // นับจำนวนแยกตามชื่อ Model จากเครื่องที่กรองมาแล้ว
  const modelCounts = {};
  filteredDevices.forEach(device => {
    // ดึงรุ่นเครื่องออกมา ถ้าว่างให้ใส่เป็น "Unknown Model"
    const rawModel = device.system?.model;
    const modelName = (rawModel && rawModel.trim() !== "") ? rawModel.trim() : "Unknown Model";
    
    modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
  });

  // ==========================================
  // ขั้นตอนที่ C: จัดรูปแบบสำหรับกราฟ (เรียงลำดับ & ตัด Top 10)
  // ==========================================
  const top10Models = Object.entries(modelCounts)
    .map(([modelName, count]) => ({
      label: modelName,
      value: count
    }))
    .sort((a, b) => b.value - a.value) // เรียงจากมากไปน้อย
    .slice(0, 10); // ตัดเอาแค่ 10 อันดับแรก

  // สวมชุดสี
  const finalGraphData = top10Models.map((item, index) => ({
    id: index + 1,
    label: item.label,
    value: item.value,
    color: barColors[index] || "bg-gray-400" 
  }));

  return (
    <div className="w-full h-[360px] pr-10 mt-4">
      <BarGraph
        title="Top 10 Model By Device" 
        icon={ServerIcon}
        data={finalGraphData} // โยนข้อมูลที่กรองแล้วลงกราฟ
      />
    </div>
  );
}
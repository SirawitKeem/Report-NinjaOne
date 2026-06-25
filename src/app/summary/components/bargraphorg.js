// bargraphorg.js
import React from 'react';
import BarGraph from '../../Components/BarGraph'; // เช็ค Path ด้วยนะครับ
import { barColors } from '../databargraphorg'; // ดึงชุดสีมาใช้

// นำเข้า API
import { getDevicesData } from '../../lib/device';
import { getOrganizationsData } from '../../lib/organizations';

const BuildingIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default async function SummaryBarGraph() {
  // 1. ดึงข้อมูลจาก API
  const devices = await getDevicesData();
  const orgs = await getOrganizationsData();

  // 2. สร้างตัวจับคู่ ID -> ชื่อ Organization (เพื่อความรวดเร็วในการค้นหา)
  // หน้าตาจะเป็นแบบนี้ { 1: "Prod-Onprem", 2: "Dev-UAT" }
  const orgNameMap = {};
  orgs.forEach(org => {
    orgNameMap[org['ORGANIZATION ID']] = org['ORGANIZATION NAME'];
  });

  // 3. นับจำนวน Device ตาม ID ของ Organization
  const deviceCountsByOrg = {};
  devices.forEach(device => {
    const orgId = device.organizationId;
    if (orgId) {
      deviceCountsByOrg[orgId] = (deviceCountsByOrg[orgId] || 0) + 1;
    }
  });

  // 4. แปลงข้อมูลเป็น Array -> เรียงลำดับ (มากไปน้อย) -> ตัดเอาแค่ 10 อันดับแรก
  const top10Organizations = Object.entries(deviceCountsByOrg)
    .map(([orgId, count]) => ({
      orgId: orgId,
      label: orgNameMap[orgId] || `Unknown Org (${orgId})`,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); 

  
  const finalGraphData = top10Organizations.map((item, index) => ({
    id: item.orgId,
    label: item.label,
    value: item.value,
    color: barColors[index] || "bg-gray-400" 
  }));
 // 5. ระยะห่าง
  return (
    <div className="w-full h-[260px] pr-4 mt-2">
      <BarGraph
        title="Top 10 Organization By Device"
        icon={BuildingIcon}
        data={finalGraphData}
      />
    </div>
  );
}
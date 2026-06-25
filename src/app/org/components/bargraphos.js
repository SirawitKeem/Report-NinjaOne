import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { barColors } from '../databargraphos';
import { getDevicesData } from '../../lib/device';

const MonitorIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default async function OrgSummaryOsBarGraph() {
  const devices = await getDevicesData();

  // A: หา Org ที่มี Device มากที่สุด
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

  // B: กรองเฉพาะ Device ขององค์กรอันดับ 1
  const filteredDevices = devices.filter(
    d => String(d.organizationId) === String(topOrgId)
  );

  // C: นับจำนวนแยกตาม os.name (ชื่อเวอร์ชัน เช่น "Windows 11 Pro", "Ubuntu 22.04")
  const osCounts = {};
  filteredDevices.forEach(device => {
    // os.name คือชื่อเต็มของ OS เช่น "Windows Server 2022", "Ubuntu 22.04.3 LTS"
    const label = device.os?.name?.trim() || device.nodeClass || "Unknown";
    osCounts[label] = (osCounts[label] || 0) + 1;
  });

  // D: เรียงลำดับ → Top 10 → ใส่สี
  const top10OS = Object.entries(osCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const finalGraphData = top10OS.map((item, index) => ({
    id: index + 1,
    label: item.label,
    value: item.value,
    color: barColors[index] || "bg-gray-400",
  }));

  return (
    <div className="w-full h-[360px] pr-10 mt-4">
      <BarGraph
        title="Top 10 OS Version By Device"
        icon={MonitorIcon}
        data={finalGraphData}
      />
    </div>
  );
}
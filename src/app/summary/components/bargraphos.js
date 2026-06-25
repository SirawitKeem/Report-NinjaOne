import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { barColors } from '../databargraphorg';
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

// แปลง nodeClass → ชื่อที่อ่านง่าย สำหรับแสดงบน Graph
const NODE_CLASS_LABELS = {
  WINDOWS_WORKSTATION: "Windows",
  WINDOWS:             "Windows",
  WINDOWS_SERVER:      "Windows Server",
  LINUX_WORKSTATION:   "Linux",
  LINUX_SERVER:        "Linux Server",
  LINUX:               "Linux",
  MAC:                 "macOS",
  APPLE_MAC:           "macOS",
  ANDROID:             "Android",
  NETWORK_DEVICE:      "Network Device",
  NMS:                 "Network Device",
  VMWARE_VM:           "VMware VM",
  HYPERV_VM:           "Hyper-V VM",
};

export default async function SummaryOsBarGraph() {
  // 1. ดึงข้อมูล
  const devices = await getDevicesData();

  // 2. นับจำนวน Device แยกตาม nodeClass
  const osCounts = {};
  devices.forEach(device => {
    const rawNodeClass = String(device.nodeClass || "").toUpperCase();

    // แปลงเป็นชื่อที่อ่านง่าย ถ้าไม่มีใน Map ให้ใช้ nodeClass ตรงๆ
    const label = NODE_CLASS_LABELS[rawNodeClass] || rawNodeClass || "Unknown";

    osCounts[label] = (osCounts[label] || 0) + 1;
  });

  // 3. เรียงลำดับ → Top 10
  const top10OS = Object.entries(osCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // 4. ใส่สี
  const finalGraphData = top10OS.map((item, index) => ({
    id: index + 1,
    label: item.label,
    value: item.value,
    color: barColors[index] || "bg-gray-400",
  }));

  return (
    <div className="w-full h-[260px] pr-4 mt-2">
      <BarGraph
        title="Top 10 OS By Device"
        icon={MonitorIcon}
        data={finalGraphData}
      />
    </div>
  );
}
import React from 'react';
import BarGraph from '../../Components/BarGraph';
import { barColors } from '../databargraphorg';
import { getDevicesData } from '../../lib/device';

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

export default async function SummaryModelBarGraph() {
  const devices = await getDevicesData();

  const modelCounts = {};
  devices.forEach(device => {
    // system.model มาจาก device.js ที่เพิ่ม system กลับเข้าไปแล้ว
    const rawModel = device.system?.model;
    const modelName = (rawModel && rawModel.trim() !== "")
      ? rawModel.trim()
      : "Unknown Model";

    modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
  });

  const top10Models = Object.entries(modelCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const finalGraphData = top10Models.map((item, index) => ({
    id: index + 1,
    label: item.label,
    value: item.value,
    color: barColors[index] || "bg-gray-400",
  }));

  return (
    <div className="w-full h-[260px] pr-4 mt-2">
      <BarGraph
        title="Top 10 Model By Device"
        icon={ServerIcon}
        data={finalGraphData}
      />
    </div>
  );
}